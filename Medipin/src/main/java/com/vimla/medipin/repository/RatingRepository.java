package com.vimla.medipin.repository;

import com.vimla.medipin.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByFacility_FacilityId(Long facilityId);
}
