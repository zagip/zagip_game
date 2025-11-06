package ru.vlppz.zgbackend.DB.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.vlppz.zgbackend.DB.NFT.NFT;

@Entity
@Table(name = "users")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long telegramId;

    @Column(nullable = false)
    private Long balance;

    @Column
    private String username;

    @Column
    private String avatarURL;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pinned_nft_id")
    private NFT pinnedNFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by_id")
    private User referredBy;

    @Column
    private Integer referralCount = 0;
}


