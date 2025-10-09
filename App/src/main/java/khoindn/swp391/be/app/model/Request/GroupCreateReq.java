package khoindn.swp391.be.app.model.Request;

import jakarta.validation.constraints.NotNull;
import khoindn.swp391.be.app.model.formatReq.CoOwner_Info;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupCreateReq {

    @NotNull
    private int vehicleId;
    private List<CoOwner_Info> member;
    private String roleInGroup;

}
