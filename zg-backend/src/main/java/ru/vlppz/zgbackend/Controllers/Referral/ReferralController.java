package ru.vlppz.zgbackend.Controllers.Referral;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/referral")
public class ReferralController {
    @Autowired
    private UserRepository userRepository;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @GetMapping("/link")
    public ResponseEntity<ReferralLinkResponse> getReferralLink(Authentication authentication) {
        ReferralLinkResponse response = new ReferralLinkResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            
            response.status = "ok";
            response.referralLink = "https://t.me/" + botUsername + "?start=" + user.getTelegramId();
            response.referralCount = user.getReferralCount();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<ReferralListResponse> getReferralList(Authentication authentication) {
        ReferralListResponse response = new ReferralListResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            List<User> referrals = userRepository.findByReferredBy(user);
            
            response.status = "ok";
            response.referrals = referrals.stream()
                .map(referral -> {
                    ReferralInfo info = new ReferralInfo();
                    info.username = referral.getUsername() != null ? referral.getUsername() : "Пользователь";
                    info.avatarUrl = referral.getAvatarURL();
                    info.balance = referral.getBalance();
                    return info;
                })
                .toList();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}