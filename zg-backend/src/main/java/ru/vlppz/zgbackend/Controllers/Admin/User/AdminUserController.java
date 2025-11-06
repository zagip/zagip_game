package ru.vlppz.zgbackend.Controllers.Admin.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/user")
public class AdminUserController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/balance")
    public ResponseEntity<UserBalanceResponse> updateUserBalance(@RequestBody UserBalanceRequest request) {
        UserBalanceResponse response = new UserBalanceResponse();
        
        try {
            Optional<User> userOptional = userRepository.findByUsername(request.username);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            user.setBalance(request.newBalance);
            userRepository.save(user);
            
            response.status = "ok";
            response.message = "Баланс успешно обновлен";
            response.username = user.getUsername();
            response.newBalance = user.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}