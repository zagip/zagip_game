package ru.vlppz.zgbackend.Controllers.Admin.NFT;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.vlppz.zgbackend.DB.Auction.AuctionRepository;
import ru.vlppz.zgbackend.DB.NFT.NFT;
import ru.vlppz.zgbackend.DB.NFT.NFTRepository;
import ru.vlppz.zgbackend.DB.User.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/nft")
@Validated
public class AdminNFTController {
    @Autowired
    private NFTRepository nftRepository;
    
    @Autowired
    private AuctionRepository auctionRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NFTCreateResponse> createNFT(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Long price,
            @RequestParam("gradientColor1") String gradientColor1,
            @RequestParam("gradientColor2") String gradientColor2,
            @RequestParam("amount") Long amount,
            @RequestParam("image") MultipartFile image) {
        NFTCreateResponse response = new NFTCreateResponse();

        try {
            if (image == null || image.isEmpty()) {
                throw new IllegalArgumentException("Требуется файл изображения");
            }

            String originalFilename = image.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID() + extension;

            Path uploadsDir = Paths.get("uploads");
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }
            Path targetPath = uploadsDir.resolve(filename);
            Files.write(targetPath, image.getBytes());

            String imageUrl = "/api/uploads/" + filename;

            List<NFT> created = new ArrayList<>();
            for (int i = 0; i < amount; i++) {
                NFT nft = new NFT();
                nft.setName(name);
                nft.setDescription(description);
                nft.setPrice(price);
                nft.setGradientColor1(gradientColor1);
                nft.setGradientColor2(gradientColor2);
                nft.setImageURL(imageUrl);
                created.add(nftRepository.save(nft));
            }

            response.status = "ok";
            response.nfts = created;
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<NFTDeleteResponse> deleteNFT(@RequestBody NFTDeleteRequest nftDeleteRequest) {
        NFTDeleteResponse response = new NFTDeleteResponse();
        
        try {
            Optional<NFT> nftOptional = nftRepository.findById(nftDeleteRequest.id);
            if (nftOptional.isEmpty()) {
                response.status = "error";
                response.error = "NFT не найден";
                return ResponseEntity.badRequest().body(response);
            }

            NFT nft = nftOptional.get();
            
            // If NFT is owned, unpin it from the owner first
            if (nft.getOwner() != null) {
                var owner = nft.getOwner();
                if (owner.getPinnedNFT() != null && owner.getPinnedNFT().equals(nft)) {
                    owner.setPinnedNFT(null);
                    userRepository.save(owner);
                }
            }
            
            // Delete all auction records for this NFT first (including active and inactive ones)
            var allAuctions = auctionRepository.findByNft(nft);
            auctionRepository.deleteAll(allAuctions);
            
            // Delete the image file if it exists
            if (nft.getImageURL() != null && nft.getImageURL().startsWith("/api/uploads/")) {
                String filename = nft.getImageURL().replace("/api/uploads/", "");
                Path imagePath = Paths.get("uploads", filename);
                try {
                    Files.deleteIfExists(imagePath);
                } catch (IOException e) {
                    System.err.println("Не удалось удалить файл изображения: " + e.getMessage());
                }
            }

            // Now safely delete the NFT
            nftRepository.delete(nft);
            
            response.status = "ok";
            response.message = "NFT успешно удален";
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
