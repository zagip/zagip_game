package ru.vlppz.zgbackend.Services;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class ReferralTrackingService {
    
    private final Map<Long, Long> pendingReferrals = new ConcurrentHashMap<>();
    
    public void trackReferral(Long newUserTelegramId, Long referrerTelegramId) {
        pendingReferrals.put(newUserTelegramId, referrerTelegramId);
    }
    
    public Long getReferrer(Long telegramId) {
        return pendingReferrals.remove(telegramId);
    }
    
    public void clearReferral(Long telegramId) {
        pendingReferrals.remove(telegramId);
    }
}