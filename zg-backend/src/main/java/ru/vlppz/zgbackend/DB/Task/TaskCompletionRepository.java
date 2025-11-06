package ru.vlppz.zgbackend.DB.Task;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vlppz.zgbackend.DB.User.User;

public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
    boolean existsByTaskAndUser(Task task, User user);
    Long countByUser(User user);
}