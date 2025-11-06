package ru.vlppz.zgbackend.DB.Code;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vlppz.zgbackend.DB.User.User;

public interface CodeUsageRepository extends JpaRepository<CodeUsage, Long> {
    boolean existsByCodeAndUser(Code code, User user);
    Long countByUser(User user);
}