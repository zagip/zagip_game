package ru.vlppz.zgbackend.Controllers.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Code.CodeUsageRepository;
import ru.vlppz.zgbackend.DB.Task.TaskCompletionRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserStatsController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskCompletionRepository taskCompletionRepository;
    
    @Autowired
    private CodeUsageRepository codeUsageRepository;

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(Authentication authentication) {
        UserStatsResponse response = new UserStatsResponse();
        
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
            response.tasksCompleted = taskCompletionRepository.countByUser(user);
            response.codesActivated = codeUsageRepository.countByUser(user);
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}