package ru.vlppz.zgbackend.Controllers.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;
import ru.vlppz.zgbackend.DB.User.Role;
import ru.vlppz.zgbackend.Services.JwtTokenProvider;
import ru.vlppz.zgbackend.Services.TelegramAuthService;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    @Autowired
    private TelegramAuthService telegramAuthService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/telegram")
    public ResponseEntity<AuthResponse> authTelegram(@RequestBody TelegramAuthRequest request) {
        User user = telegramAuthService.authenticateOrCreate(request.initData);

        String roleName = user.getRole() != null ? user.getRole().name() : Role.USER.name();
        
        String token = jwtTokenProvider.generateToken(user.getId(), roleName);

        AuthResponse response = new AuthResponse();
        response.userId = user.getId();
        response.balance = user.getBalance();
        response.username = user.getUsername();
        response.avatarUrl = user.getAvatarURL();
        response.token = token;
        response.role = roleName;
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(user);
    }
}


