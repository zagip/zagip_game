package ru.vlppz.zgbackend.Controllers.Code;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Code.Code;
import ru.vlppz.zgbackend.DB.Code.CodeRepository;
import ru.vlppz.zgbackend.DB.Code.CodeUsage;
import ru.vlppz.zgbackend.DB.Code.CodeUsageRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/code")
public class CodeController {
    @Autowired
    private CodeRepository codeRepository;
    
    @Autowired
    private CodeUsageRepository codeUsageRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/redeem")
    @Transactional
    public ResponseEntity<CodeRedeemResponse> redeemCode(@RequestBody CodeRedeemRequest request, Authentication authentication) {
        CodeRedeemResponse response = new CodeRedeemResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            Optional<Code> codeOptional = codeRepository.findByCodeAndActiveTrue(request.code);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (codeOptional.isEmpty()) {
                response.status = "error";
                response.error = "Код не найден или неактивен";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            Code code = codeOptional.get();
            
            // Check if user already used this code
            if (codeUsageRepository.existsByCodeAndUser(code, user)) {
                response.status = "error";
                response.error = "Вы уже использовали этот код";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if code has uses left
            if (code.getCurrentUses() >= code.getMaxUses()) {
                response.status = "error";
                response.error = "Код исчерпан";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Redeem code
            user.setBalance(user.getBalance() + code.getReward());
            code.setCurrentUses(code.getCurrentUses() + 1);
            
            // Create usage record
            CodeUsage usage = new CodeUsage();
            usage.setCode(code);
            usage.setUser(user);
            usage.setUsedAt(LocalDateTime.now());
            
            userRepository.save(user);
            codeRepository.save(code);
            codeUsageRepository.save(usage);
            
            response.status = "ok";
            response.message = "Код активирован! Получено " + code.getReward() + " монет";
            response.reward = code.getReward();
            response.newBalance = user.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}