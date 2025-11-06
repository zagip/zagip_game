package ru.vlppz.zgbackend.Controllers.Auth;

import jakarta.validation.constraints.NotBlank;

public class TelegramAuthRequest {
    @NotBlank
    public String initData;
}


