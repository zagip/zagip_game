package ru.vlppz.zgbackend.Controllers.Admin.NFT;

import ru.vlppz.zgbackend.DB.NFT.NFT;

import java.util.List;

public class NFTCreateResponse {
    public String status;
    public String error;
    public List<NFT> nfts;
}
