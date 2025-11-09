package com.vimla.medipin.controller;

import com.vimla.medipin.entity.Rating;
import com.vimla.medipin.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "http://localhost:5500", allowCredentials = "true")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = ((Number) payload.get("user_id")).longValue();
            Long facilityId = ((Number) payload.get("facility_id")).longValue();
            int stars = (int) payload.get("stars");
            String reviewText = (String) payload.get("review_text");

            Rating rating = ratingService.addReview(userId, facilityId, stars, reviewText);
            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{facilityId}")
    public ResponseEntity<List<Rating>> getReviews(@PathVariable Long facilityId) {
        List<Rating> reviews = ratingService.getReviewsForFacility(facilityId);
        return ResponseEntity.ok(reviews);
    }
}
