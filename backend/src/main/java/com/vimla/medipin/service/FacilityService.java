package com.vimla.medipin.service;

import com.vimla.medipin.dto.FacilityDTO;
import com.vimla.medipin.entity.Facility;
import com.vimla.medipin.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public List<Facility> getFacilitiesByType(String type) {
        return facilityRepository.findByTypeIgnoreCase(type);
    }

    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id).orElse(null);
    }

    // Get nearby facilities within 5 km, return DTOs with distance
    public List<FacilityDTO> getNearbyFacilities(double lat, double lng, String type) {
        double distanceMeters = 5000; // 5 km
        Point point = geometryFactory.createPoint(new Coordinate(lng, lat));

        List<Object[]> results;

        if (type != null && !type.isBlank()) {
            results = facilityRepository.findNearbyByTypeWithDistance(point, distanceMeters, type);
        } else {
            results = facilityRepository.findNearbyWithDistance(point, distanceMeters);
        }

        //  Convert query result (Object[]) → DTO
        return results.stream().map(r -> {
            return FacilityDTO.builder()
                    .facilityId(((Number) r[0]).longValue())
                    .name((String) r[1])
                    .type((String) r[2])
                    .address((String) r[3])
                    .contact((String) r[4])
                    .hours((String) r[5])
                    .latitude(((Number) r[6]).doubleValue())
                    .longitude(((Number) r[7]).doubleValue())
                    .distanceMeters(((Number) r[8]).doubleValue())
                    .build();
        }).collect(Collectors.toList());
    }
}
