package com.vimla.medipin.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO {
    private int stars;
    private String reviewText;
    private LocalDateTime date;
    private String userName;
}
