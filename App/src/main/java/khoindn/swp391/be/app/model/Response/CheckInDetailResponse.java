package khoindn.swp391.be.app.model.Response;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class CheckInDetailResponse {
    private Integer checkInId;
    private LocalDateTime checkInTime;
    private String condition;
    private String notes;
    private String images;
}
