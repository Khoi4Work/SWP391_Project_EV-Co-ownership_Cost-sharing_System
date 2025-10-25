package khoindn.swp391.be.app.model.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckOutRequest {
    private int userId;
    private String condition;
    private String notes;
    private String images;
    
}
