package com.vimla.medipin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityDTO {
    private Long facilityId;
    private String name;
    private String type;
    private String address;
    private String contact;
    private String hours;
    private Double latitude;
    private Double longitude;
    private Double distanceMeters; // ✅ new
}
