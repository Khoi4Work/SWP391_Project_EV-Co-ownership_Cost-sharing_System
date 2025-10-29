package khoindn.swp391.be.app.model.Response;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class CheckOutDetailResponse {
    private Integer checkOutId;
    private LocalDateTime checkOutTime;
    private String condition;
    private String notes;
    private String images;
}
