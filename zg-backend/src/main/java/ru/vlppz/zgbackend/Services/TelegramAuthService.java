package ru.vlppz.zgbackend.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;
import ru.vlppz.zgbackend.Services.ReferralTrackingService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

// Premium Grok AI code
@Service
public class TelegramAuthService {

    private static final Logger log = LoggerFactory.getLogger(TelegramAuthService.class);
    private static final Set<String> ALLOWED_KEYS = Set.of("query_id", "user", "auth_date", "hash");

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ReferralTrackingService referralTrackingService;

    @Value("${telegram.bot.token}")
    private String botToken;

    public TelegramAuthService(UserRepository userRepository, ObjectMapper objectMapper, ReferralTrackingService referralTrackingService) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.referralTrackingService = referralTrackingService;
    }

    public User authenticateOrCreate(String rawInitData) {
        return authenticateOrCreate(rawInitData, null);
    }

    public User authenticateOrCreate(String rawInitData, Long referrerTelegramId) {
        if (rawInitData == null || rawInitData.isBlank()) {
            throw new IllegalArgumentException("initData is empty");
        }

        // 1. Normalise – decode exactly once
        String initData = URLDecoder.decode(rawInitData, StandardCharsets.UTF_8);
        log.info("tg.initData(normalized)={}", initData);

        // 2. Parse into a map (values stay URL-encoded – this is what Telegram expects)
        Map<String, String> data = parseInitData(initData);

        // 3. Reject unknown keys (especially the rogue `signature`)
        Set<String> unknown = new HashSet<>(data.keySet());
        unknown.removeAll(ALLOWED_KEYS);
        if (!unknown.isEmpty()) {
            log.warn("Ignoring unknown initData keys: {}", unknown);
            unknown.forEach(data::remove);
        }

        // 4. Verify HMAC
        if (!verify(data, initData)) {
            log.info("tg.verify failed – received hash={}, calculated hash={}",
                    data.get("hash"), computeHash(data, initData));
            throw new IllegalArgumentException("Invalid Telegram initData");
        }

        log.info("Signature - ok");

        // 5. Extract user JSON (may be double-encoded)
        String userJson = data.get("user");
        String decoded = decodeUserJson(userJson);
        log.info("tg.user decoded={}", decoded);

        Map<String, Object> userMap = readJson(decoded);
        Long telegramId = Long.valueOf(String.valueOf(userMap.get("id")));
        String username = userMap.get("username") != null ? String.valueOf(userMap.get("username")) : null;
        String photoUrl = userMap.get("photo_url") != null ? String.valueOf(userMap.get("photo_url")) : null;

        Optional<User> existingUser = userRepository.findByTelegramId(telegramId);
        boolean isNewUser = existingUser.isEmpty();

        User user = existingUser.orElseGet(() -> {
            User u = new User();
            u.setTelegramId(telegramId);
            u.setBalance(0L);
            u.setReferralCount(0);
            return u;
        });
        
        user.setUsername(username);
        user.setAvatarURL(photoUrl);

        // Handle referral for new users
        if (isNewUser) {
            log.info("Processing new user: {}", telegramId);
            
            // Check for pending referral first
            Long pendingReferrerTelegramId = referralTrackingService.getReferrer(telegramId);
            log.info("Pending referrer for user {}: {}", telegramId, pendingReferrerTelegramId);
            
            if (pendingReferrerTelegramId != null) {
                referrerTelegramId = pendingReferrerTelegramId;
                log.info("Using pending referrer: {}", referrerTelegramId);
            }
            
            if (referrerTelegramId != null && !referrerTelegramId.equals(telegramId)) {
                log.info("Looking for referrer with telegram ID: {}", referrerTelegramId);
                Optional<User> referrer = userRepository.findByTelegramId(referrerTelegramId);
                
                if (referrer.isPresent()) {
                    log.info("Found referrer: {}", referrer.get().getId());
                    user.setReferredBy(referrer.get());
                    log.info("Set referredBy for user {} to referrer {}", telegramId, referrer.get().getTelegramId());
                    
                    // Give referral bonus to referrer
                    User referrerUser = referrer.get();
                    referrerUser.setBalance(referrerUser.getBalance() + 300L);
                    referrerUser.setReferralCount(referrerUser.getReferralCount() + 1);
                    userRepository.save(referrerUser);
                    
                    log.info("New user {} referred by {}. Referrer got 300 coins.", telegramId, referrerTelegramId);
                } else {
                    log.warn("Referrer with telegram ID {} not found in database", referrerTelegramId);
                }
            } else {
                log.info("No valid referrer for user {}", telegramId);
            }
        } else {
            log.info("User {} already exists, skipping referral processing", telegramId);
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            // Handle duplicate key error - user might have been created by another request
            log.warn("Error saving user, attempting to fetch existing user: {}", e.getMessage());
            Optional<User> existingUserRetry = userRepository.findByTelegramId(telegramId);
            if (existingUserRetry.isPresent()) {
                User existingUser2 = existingUserRetry.get();
                // Update the existing user with latest info
                existingUser2.setUsername(username);
                existingUser2.setAvatarURL(photoUrl);
                
                // Preserve referral relationship if it was set and user doesn't have one yet
                if (user.getReferredBy() != null && existingUser2.getReferredBy() == null) {
                    existingUser2.setReferredBy(user.getReferredBy());
                    log.info("Setting referredBy for existing user {} to {}", telegramId, user.getReferredBy().getTelegramId());
                }
                
                return userRepository.save(existingUser2);
            }
            throw e; // Re-throw if it's not a duplicate key issue
        }
    }

    /* --------------------------------------------------------------- */
    private Map<String, String> parseInitData(String initData) {
        Map<String, String> map = new HashMap<>();
        for (String part : initData.split("&")) {
            int eq = part.indexOf('=');
            if (eq > 0) {
                map.put(part.substring(0, eq), part.substring(eq + 1));
            }
        }
        return map;
    }

    private boolean verify(Map<String, String> data, String initData) {
        String received = data.get("hash");
        if (received == null) return false;

        String calculated = computeHash(data, initData);
        return calculated.equalsIgnoreCase(received);
    }

    private String computeHash(Map<String, String> data, String initData) {
        // Python snippet equivalent:
        // vals = {k: unquote(v) for k, v in [s.split('=', 1) for s in init_data.split('&')]}
        // data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(vals.items()) if k != 'hash')
        // secret_key = HMAC_SHA256("WebAppData", bot_token)
        // h = HMAC_SHA256(secret_key, data_check_string)
        // return h.hexdigest()

        TreeMap<String, String> vals = new TreeMap<>();
        for (String part : initData.split("&")) {
            int eq = part.indexOf('=');
            if (eq <= 0) continue;
            String key = part.substring(0, eq);
            String rawVal = part.substring(eq + 1);
            // URL-decode each value as the snippet does
            String decodedVal = URLDecoder.decode(rawVal, StandardCharsets.UTF_8);
            vals.put(key, decodedVal);
        }

        StringBuilder dataCheck = new StringBuilder();
        for (Map.Entry<String, String> e : vals.entrySet()) {
            if ("hash".equals(e.getKey())) continue;
            if (dataCheck.length() > 0) dataCheck.append('\n');
            dataCheck.append(e.getKey()).append('=').append(e.getValue());
        }

        try {
            // secret_key = HMAC_SHA256("WebAppData", bot_token)
            Mac macSecret = Mac.getInstance("HmacSHA256");
            macSecret.init(new SecretKeySpec("WebAppData".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] secretKey = macSecret.doFinal(botToken.trim().getBytes(StandardCharsets.UTF_8));

            // h = HMAC_SHA256(secret_key, data_check_string)
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] hmac = mac.doFinal(dataCheck.toString().getBytes(StandardCharsets.UTF_8));

            String hex = javax.xml.bind.DatatypeConverter.printHexBinary(hmac).toLowerCase();
            log.info("tg.verify data_check_string=\n{}\ncalc_hash={}", dataCheck, hex);
            return hex;
        } catch (Exception e) {
            log.warn("HMAC error", e);
            return "";
        }
    }

    private String decodeUserJson(String encoded) {
        String s = encoded;
        int attempts = 0;
        while (attempts < 3 && (s.startsWith("%7B") || s.contains("%22"))) {
            s = URLDecoder.decode(s, StandardCharsets.UTF_8);
            attempts++;
        }
        return s;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readJson(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid user JSON", e);
        }
    }
}