package ru.vlppz.zgbackend.Controllers.Admin.Task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Task.Task;
import ru.vlppz.zgbackend.DB.Task.TaskRepository;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/task")
public class AdminTaskController {
    @Autowired
    private TaskRepository taskRepository;

    @PostMapping("/create")
    public ResponseEntity<TaskCreateResponse> createTask(@RequestBody TaskCreateRequest request) {
        TaskCreateResponse response = new TaskCreateResponse();
        
        try {
            Task task = new Task();
            task.setTitle(request.title);
            task.setDescription(request.description);
            task.setLink(request.link);
            task.setReward(Long.valueOf(request.reward));
            task.setActive(true);
            task.setCreatedAt(LocalDateTime.now());
            
            Task savedTask = taskRepository.save(task);
            
            response.status = "ok";
            response.message = "Задание создано успешно";
            response.task = savedTask;
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<TaskListAdminResponse> getAllTasks() {
        TaskListAdminResponse response = new TaskListAdminResponse();
        response.tasks = taskRepository.findAll().stream().toList();
        return ResponseEntity.ok().body(response);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<TaskDeleteResponse> deleteTask(@RequestBody TaskDeleteRequest request) {
        TaskDeleteResponse response = new TaskDeleteResponse();
        
        try {
            if (!taskRepository.existsById(request.id)) {
                response.status = "error";
                response.error = "Задание не найдено";
                return ResponseEntity.badRequest().body(response);
            }
            
            taskRepository.deleteById(request.id);
            
            response.status = "ok";
            response.message = "Задание успешно удалено";
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}