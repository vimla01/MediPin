package com.vimla.medipin.repository;

import com.vimla.medipin.entity.Facility;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findByTypeIgnoreCase(String type);

    // ✅ Nearby (any type) with distance (within given radius)
    @Query(value = """
        SELECT facility_id, name, type, address, contact, hours, latitude, longitude,
               ST_Distance(
                   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                   ST_SetSRID(:point, 4326)::geography
               ) AS distance_meters
        FROM facility
        WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(:point, 4326)::geography,
            :distance
        )
        ORDER BY distance_meters
        """, nativeQuery = true)
    List<Object[]> findNearbyWithDistance(@Param("point") Point point, @Param("distance") double distanceMeters);

    // ✅ Nearby (by type) with distance (within given radius)
    @Query(value = """
        SELECT facility_id, name, type, address, contact, hours, latitude, longitude,
               ST_Distance(
                   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                   ST_SetSRID(:point, 4326)::geography
               ) AS distance_meters
        FROM facility
        WHERE LOWER(type) = LOWER(:type)
          AND ST_DWithin(
              ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
              ST_SetSRID(:point, 4326)::geography,
              :distance
          )
        ORDER BY distance_meters
        """, nativeQuery = true)
    List<Object[]> findNearbyByTypeWithDistance(@Param("point") Point point, @Param("distance") double distanceMeters, @Param("type") String type);
}
