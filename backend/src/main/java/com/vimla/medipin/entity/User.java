package com.vimla.medipin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId; 

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String location;
    private String role;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "auth_provider", length = 50)
    private String authProvider;

    
    public Long getId() {
        return userId;
    }

    public void setId(Long id) {
        this.userId = id;
    }
}
