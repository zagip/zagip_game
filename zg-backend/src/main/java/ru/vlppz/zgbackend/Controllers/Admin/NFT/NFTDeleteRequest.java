package ru.vlppz.zgbackend.Controllers.Admin.NFT;

import jakarta.validation.constraints.NotNull;

public class NFTDeleteRequest {
    @NotNull
    public Long id;
}
