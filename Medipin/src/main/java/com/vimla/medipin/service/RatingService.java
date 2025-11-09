package com.vimla.medipin.service;

import com.vimla.medipin.entity.*;
import com.vimla.medipin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    public Rating addReview(Long userId, Long facilityId, int stars, String reviewText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        Rating rating = Rating.builder()
                .user(user)
                .facility(facility)
                .stars(stars)
                .reviewText(reviewText)
                .build();

        return ratingRepository.save(rating);
    }

    public List<Rating> getReviewsForFacility(Long facilityId) {
        return ratingRepository.findByFacility_FacilityId(facilityId);
    }
}
