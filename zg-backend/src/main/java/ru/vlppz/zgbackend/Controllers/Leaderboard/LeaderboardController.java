package ru.vlppz.zgbackend.Controllers.Leaderboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.NFT.NFTRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NFTRepository nftRepository;

    @GetMapping("/users")
    public ResponseEntity<LeaderboardResponse> getLeaderboard() {
        LeaderboardResponse response = new LeaderboardResponse();
        response.users = userRepository.findAllByOrderByBalanceDesc().stream().toList();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDetailsResponse> getUserDetails(@PathVariable Long userId) {
        UserDetailsResponse response = new UserDetailsResponse();
        
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            response.status = "ok";
            response.user = user;
            response.nfts = nftRepository.findByOwner(user).stream().toList();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}