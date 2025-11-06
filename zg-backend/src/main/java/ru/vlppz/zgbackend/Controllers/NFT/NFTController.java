package ru.vlppz.zgbackend.Controllers.NFT;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import ru.vlppz.zgbackend.DB.Auction.AuctionRepository;
import ru.vlppz.zgbackend.DB.NFT.NFT;
import ru.vlppz.zgbackend.DB.NFT.NFTRepository;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;


import java.util.Optional;

@RestController
@RequestMapping("/api/nft")
public class NFTController {
    @Autowired
    private NFTRepository nftRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuctionRepository auctionRepository;
    


    @GetMapping("/all")
    public ResponseEntity<NFTListResponse> listAllNFTs() {
        NFTListResponse response = new NFTListResponse();
        response.nfts = nftRepository.findByOwnerIsNull().stream().toList();
        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/buy")
    public ResponseEntity<NFTBuyResponse> buyNFT(@RequestBody NFTBuyRequest request, Authentication authentication) {
        NFTBuyResponse response = new NFTBuyResponse();
        
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
            
            if (nft.getOwner() != null) {
                response.status = "error";
                response.error = "NFT уже куплен";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (user.getBalance() < nft.getPrice()) {
                response.status = "error";
                response.error = "Недостаточно средств";
                return ResponseEntity.badRequest().body(response);
            }
            
            user.setBalance(user.getBalance() - nft.getPrice());
            nft.setOwner(user);
            
            userRepository.save(user);
            nftRepository.save(nft);
            
            response.status = "ok";
            response.message = "NFT успешно куплен";
            response.newBalance = user.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<NFTListResponse> getMyNFTs(Authentication authentication) {
        NFTListResponse response = new NFTListResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                response.nfts = java.util.Collections.emptyList();
                return ResponseEntity.ok().body(response);
            }
            
            User user = userOptional.get();
            response.nfts = nftRepository.findByOwnerAndNotInActiveAuction(user).stream().toList();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.nfts = java.util.Collections.emptyList();
            return ResponseEntity.ok().body(response);
        }
    }

    @PostMapping("/pin")
    public ResponseEntity<NFTActionResponse> pinNFT(@RequestBody NFTActionRequest request, Authentication authentication) {
        NFTActionResponse response = new NFTActionResponse();
        
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
            
            user.setPinnedNFT(nft);
            userRepository.save(user);
            
            response.status = "ok";
            response.message = "NFT закреплен";
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<NFTActionResponse> sellNFT(@RequestBody NFTActionRequest request, Authentication authentication) {
        NFTActionResponse response = new NFTActionResponse();
        
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
            
            // Check if NFT has active auctions
            var activeAuction = auctionRepository.findByNftAndActiveTrue(nft);
            if (activeAuction.isPresent()) {
                response.status = "error";
                response.error = "Нельзя продать NFT с активным аукционом. Сначала отмените аукцион.";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Sell for 75% of original price
            Long sellPrice = (long) (nft.getPrice() * 0.75);
            user.setBalance(user.getBalance() + sellPrice);
            
            // Remove ownership and unpin if pinned
            if (user.getPinnedNFT() != null && user.getPinnedNFT().equals(nft)) {
                user.setPinnedNFT(null);
            }
            
            // Delete the NFT completely instead of returning to shop
            nftRepository.delete(nft);
            userRepository.save(user);
            
            response.status = "ok";
            response.message = "NFT продан за " + sellPrice + " монет";
            response.newBalance = user.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<NFTActionResponse> transferNFT(@RequestBody NFTTransferRequest request, Authentication authentication) {
        NFTActionResponse response = new NFTActionResponse();
        
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<User> senderOptional = userRepository.findById(userId);
            Optional<User> receiverOptional = userRepository.findByUsername(request.receiverUsername);
            Optional<NFT> nftOptional = nftRepository.findById(request.nftId);
            
            if (senderOptional.isEmpty()) {
                response.status = "error";
                response.error = "Пользователь не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (receiverOptional.isEmpty()) {
                response.status = "error";
                response.error = "Получатель не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (nftOptional.isEmpty()) {
                response.status = "error";
                response.error = "NFT не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            User sender = senderOptional.get();
            User receiver = receiverOptional.get();
            NFT nft = nftOptional.get();
            
            if (!nft.getOwner().equals(sender)) {
                response.status = "error";
                response.error = "Вы не владеете этим NFT";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (sender.getBalance() < 100) {
                response.status = "error";
                response.error = "Недостаточно средств для перевода (100 монет)";
                return ResponseEntity.badRequest().body(response);
            }
            
            if (sender.equals(receiver)) {
                response.status = "error";
                response.error = "Нельзя передать NFT самому себе";
                return ResponseEntity.badRequest().body(response);
            }
            
            // Transfer NFT and charge fee
            sender.setBalance(sender.getBalance() - 100);
            if (sender.getPinnedNFT() != null && sender.getPinnedNFT().equals(nft)) {
                sender.setPinnedNFT(null);
            }
            nft.setOwner(receiver);
            
            userRepository.save(sender);
            nftRepository.save(nft);
            
            response.status = "ok";
            response.message = "NFT передан пользователю " + receiver.getUsername();
            response.newBalance = sender.getBalance();
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }


}
