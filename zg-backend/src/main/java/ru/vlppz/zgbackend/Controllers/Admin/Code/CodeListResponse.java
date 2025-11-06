package ru.vlppz.zgbackend.Controllers.Admin.Code;

import ru.vlppz.zgbackend.DB.Code.Code;

import java.util.List;

public class CodeListResponse {
    public String status = "ok";
    public List<Code> codes;
}