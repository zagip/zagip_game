package ru.vlppz.zgbackend.Controllers.Task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Task.Task;
import ru.vlppz.zgbackend.DB.Task.TaskCompletion;
import ru.vlppz.zgbackend.DB.Task.TaskCompletionRepository;
import ru.vlppz.zgbackend.DB.Task.TaskRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/task")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private TaskCompletionRepository taskCompletionRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public ResponseEntity<TaskListResponse> getAllTasks(Authentication authentication) {
        TaskListResponse response = new TaskListResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.tasks = java.util.Collections.emptyList();
                return ResponseEntity.ok().body(response);
            }
            
            User user = userOptional.get();
            List<Task> allTasks = taskRepository.findByActiveTrue();
            
            // Add completion status to tasks
            response.tasks = allTasks.stream().map(task -> {
                TaskWithStatus taskWithStatus = new TaskWithStatus();
                taskWithStatus.id = task.getId();
                taskWithStatus.title = task.getTitle();
                taskWithStatus.description = task.getDescription();
                taskWithStatus.link = task.getLink();
                taskWithStatus.reward = task.getReward();
                taskWithStatus.completed = taskCompletionRepository.existsByTaskAndUser(task, user);
                return taskWithStatus;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.tasks = java.util.Collections.emptyList();
            return ResponseEntity.ok().body(response);
        }
    }

    @PostMapping("/complete")
    @Transactional
    public ResponseEntity<TaskCompleteResponse> completeTask(@RequestBody TaskCompleteRequest request, Authentication authentication) {
        TaskCompleteResponse response = new TaskCompleteResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            Optional<Task> taskOptional = taskRepository.findById(request.taskId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (taskOptional.isEmpty()) {
                response.status = "error";
                response.error = "Задание не найдено";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            Task task = taskOptional.get();
            
            // Check if user already completed this task
            if (taskCompletionRepository.existsByTaskAndUser(task, user)) {
                response.status = "error";
                response.error = "Задание уже выполнено";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Complete task
            user.setBalance(user.getBalance() + task.getReward());
            
            // Create completion record
            TaskCompletion completion = new TaskCompletion();
            completion.setTask(task);
            completion.setUser(user);
            completion.setCompletedAt(LocalDateTime.now());
            
            userRepository.save(user);
            taskCompletionRepository.save(completion);
            
            response.status = "ok";
            response.message = "Задание выполнено! Получено " + task.getReward() + " монет";
            response.reward = task.getReward();
            response.newBalance = user.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}