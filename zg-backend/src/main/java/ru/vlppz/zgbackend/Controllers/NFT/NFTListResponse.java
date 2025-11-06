package ru.vlppz.zgbackend.Controllers.NFT;

import lombok.Getter;
import lombok.Setter;
import ru.vlppz.zgbackend.DB.NFT.NFT;

import java.util.List;

@Getter
@Setter
public class NFTListResponse {
    public List<NFT> nfts;
}
