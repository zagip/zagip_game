package ru.vlppz.zgbackend.Controllers.Admin.Task;

import ru.vlppz.zgbackend.DB.Task.Task;

import java.util.List;

public class TaskListAdminResponse {
    public String status = "ok";
    public List<Task> tasks;
}