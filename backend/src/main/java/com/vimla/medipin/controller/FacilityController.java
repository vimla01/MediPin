package com.vimla.medipin.controller;

import com.vimla.medipin.dto.FacilityDTO;
import com.vimla.medipin.entity.Facility;
import com.vimla.medipin.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    public List<FacilityDTO> getAllFacilities() {
        return facilityService.getAllFacilities().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/hospitals")
    public List<FacilityDTO> getHospitals() {
        return facilityService.getFacilitiesByType("Hospital").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/clinics")
    public List<FacilityDTO> getClinics() {
        return facilityService.getFacilitiesByType("Clinic").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public FacilityDTO createFacility(@RequestBody Facility facility) {
        Facility saved = facilityService.createFacility(facility);
        return toDTO(saved);
    }

    @GetMapping("/{id}")
    public FacilityDTO getFacility(@PathVariable Long id) {
        Facility facility = facilityService.getFacilityById(id);
        return facility != null ? toDTO(facility) : null;
    }

   //nearby Facilities Endpoint
    @GetMapping("/nearby")
    public List<FacilityDTO> getNearbyFacilities(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) String type
    ) {
        return facilityService.getNearbyFacilities(lat, lng, type);
    }

    private FacilityDTO toDTO(Facility f) {
        return new FacilityDTO(
                f.getFacilityId(),
                f.getName(),
                f.getType(),
                f.getAddress(),
                f.getContact(),
                f.getHours(),
                f.getLatitude(),
                f.getLongitude(),
                null // distance not applicable for these endpoints
        );
    }
}
