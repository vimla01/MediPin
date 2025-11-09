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

    // ✅ Show basic user info, hide sensitive data
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler",
            "password", "email", "role", "authProvider", "profilePicture"
    })
    private User user;

    // ✅ Avoid infinite nesting
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer", "handler",
            "ratings"  // ⛔ prevent looping back into rating list
    })
    private Facility facility;
}
