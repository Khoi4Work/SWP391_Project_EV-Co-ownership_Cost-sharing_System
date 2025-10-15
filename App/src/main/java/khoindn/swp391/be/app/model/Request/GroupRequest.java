package khoindn.swp391.be.app.model.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupRequest {
    @Positive
    private Integer groupId;
    @NotBlank
    private String nameRequestGroup;
    private String descriptionRequestGroup = "No description";

}
