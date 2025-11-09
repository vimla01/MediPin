package com.vimla.medipin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
@Table(name = "facility")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facilityId;

    private String name;
    private String type; // e.g., Hospital
    private String address;
    private String contact;
    private String hours;
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geom;

    // ✅ One facility can have many ratings
    @OneToMany(mappedBy = "facility", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"facility"}) // ⛔ Prevent infinite recursion
    private List<Rating> ratings;
}
