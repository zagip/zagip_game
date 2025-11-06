package ru.vlppz.zgbackend.DB.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByTelegramId(Long telegramId);
    Optional<User> findByUsername(String username);
    List<User> findAllByOrderByBalanceDesc();
    List<User> findByReferredBy(User referredBy);
}


