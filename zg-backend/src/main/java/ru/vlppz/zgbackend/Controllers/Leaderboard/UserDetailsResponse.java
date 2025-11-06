package ru.vlppz.zgbackend.Controllers.Leaderboard;

import ru.vlppz.zgbackend.DB.NFT.NFT;
import ru.vlppz.zgbackend.DB.User.User;

import java.util.List;

public class UserDetailsResponse {
    public String status;
    public String error;
    public User user;
    public List<NFT> nfts;
}