package ru.vlppz.zgbackend.DB.Auction;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vlppz.zgbackend.DB.NFT.NFT;
import ru.vlppz.zgbackend.DB.User.User;

import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByActiveTrue();
    List<Auction> findBySellerAndActiveTrue(User seller);
    Optional<Auction> findByNftAndActiveTrue(NFT nft);
}