package com.vimla.medipin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    private int stars;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    private LocalDateTime date = LocalDateTime.now();

   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler",
            "password", "email", "role", "authProvider", "profilePicture"
    })
    private User user;

   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler",
            "ratings"  
    })
    private Facility facility;
}
