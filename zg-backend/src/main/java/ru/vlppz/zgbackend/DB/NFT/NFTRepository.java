package ru.vlppz.zgbackend.DB.NFT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vlppz.zgbackend.DB.User.User;

import java.util.List;

public interface NFTRepository extends JpaRepository<NFT, Long> {
    List<NFT> findByOwnerIsNull();
    List<NFT> findByOwner(User owner);
    
    @Query("SELECT n FROM NFT n WHERE n.owner = :owner AND n.id NOT IN (SELECT a.nft.id FROM Auction a WHERE a.active = true)")
    List<NFT> findByOwnerAndNotInActiveAuction(@Param("owner") User owner);
}
