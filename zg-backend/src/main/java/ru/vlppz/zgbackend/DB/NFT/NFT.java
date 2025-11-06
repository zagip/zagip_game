package ru.vlppz.zgbackend.DB.NFT;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import ru.vlppz.zgbackend.DB.User.User;

import java.awt.*;

@Getter
@Setter
@Entity
@Table(name = "nfts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NFT {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private String gradientColor1;

    @Column(nullable = false)
    private String gradientColor2;

    @Column(nullable = false)
    private String imageURL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private User owner;

    @JsonProperty("isOwned")
    public boolean isOwned() {
        return owner != null;
    }

    @JsonProperty("ownerId")
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
}
