package ru.vlppz.zgbackend.Controllers.Auction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Auction.Auction;
import ru.vlppz.zgbackend.DB.Auction.AuctionRepository;
import ru.vlppz.zgbackend.DB.NFT.NFT;
import ru.vlppz.zgbackend.DB.NFT.NFTRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auction")
public class AuctionController {
    @Autowired
    private AuctionRepository auctionRepository;
    
    @Autowired
    private NFTRepository nftRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<AuctionActionResponse> createAuction(@RequestBody AuctionCreateRequest request, Authentication authentication) {
        AuctionActionResponse response = new AuctionActionResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            Optional<NFT> nftOptional = nftRepository.findById(request.nftId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (nftOptional.isEmpty()) {
                response.status = "error";
                response.error = "NFT не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            NFT nft = nftOptional.get();
            
            if (!nft.getOwner().equals(user)) {
                response.status = "error";
                response.error = "Вы не владеете этим NFT";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.price <= 0) {
                response.status = "error";
                response.error = "Цена должна быть больше 0";
                return ResponseEntity.badRequest().body(response);
            }
            
            Auction auction = new Auction();
            auction.setNft(nft);
            auction.setSeller(user);
            auction.setPrice(request.price);
            auction.setCreatedAt(LocalDateTime.now());
            auction.setActive(true);
            
            auctionRepository.save(auction);
            
            response.status = "ok";
            response.message = "Аукцион создан";
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<AuctionListResponse> getActiveAuctions() {
        AuctionListResponse response = new AuctionListResponse();
        response.auctions = auctionRepository.findByActiveTrue().stream().toList();
        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/buy")
    public ResponseEntity<AuctionActionResponse> buyFromAuction(@RequestBody AuctionBuyRequest request, Authentication authentication) {
        AuctionActionResponse response = new AuctionActionResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> buyerOptional = userRepository.findById(userId);
            Optional<Auction> auctionOptional = auctionRepository.findById(request.auctionId);
            
            if (buyerOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (auctionOptional.isEmpty()) {
                response.status = "error";
                response.error = "Аукцион не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User buyer = buyerOptional.get();
            Auction auction = auctionOptional.get();
            
            if (!auction.getActive()) {
                response.status = "error";
                response.error = "Аукцион неактивен";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (auction.getSeller().equals(buyer)) {
                response.status = "error";
                response.error = "Нельзя купить свой собственный NFT";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (buyer.getBalance() < auction.getPrice()) {
                response.status = "error";
                response.error = "Недостаточно средств";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Transfer money and NFT
            buyer.setBalance(buyer.getBalance() - auction.getPrice());
            User seller = auction.getSeller();
            seller.setBalance(seller.getBalance() + auction.getPrice());
            
            NFT nft = auction.getNft();
            if (seller.getPinnedNFT() != null && seller.getPinnedNFT().equals(nft)) {
                seller.setPinnedNFT(null);
            }
            nft.setOwner(buyer);
            
            auction.setActive(false);
            
            userRepository.save(buyer);
            userRepository.save(seller);
            nftRepository.save(nft);
            auctionRepository.save(auction);
            
            response.status = "ok";
            response.message = "NFT куплен с аукциона";
            response.newBalance = buyer.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<AuctionActionResponse> cancelAuction(@RequestBody AuctionCancelRequest request, Authentication authentication) {
        AuctionActionResponse response = new AuctionActionResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            Optional<Auction> auctionOptional = auctionRepository.findById(request.auctionId);
            
            if (userOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (auctionOptional.isEmpty()) {
                response.status = "error";
                response.error = "Аукцион не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOptional.get();
            Auction auction = auctionOptional.get();
            
            if (!auction.getSeller().equals(user)) {
                response.status = "error";
                response.error = "Вы не можете отменить чужой аукцион";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!auction.getActive()) {
                response.status = "error";
                response.error = "Аукцион уже неактивен";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Cancel the auction
            auction.setActive(false);
            auctionRepository.save(auction);
            
            response.status = "ok";
            response.message = "Аукцион отменен, NFT возвращен";
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<AuctionListResponse> getMyAuctions(Authentication authentication) {
        AuctionListResponse response = new AuctionListResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.auctions = java.util.Collections.emptyList();
                return ResponseEntity.ok().body(response);
            }
            
            User user = userOptional.get();
            response.auctions = auctionRepository.findBySellerAndActiveTrue(user).stream().toList();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.auctions = java.util.Collections.emptyList();
            return ResponseEntity.ok().body(response);
        }
    }
}