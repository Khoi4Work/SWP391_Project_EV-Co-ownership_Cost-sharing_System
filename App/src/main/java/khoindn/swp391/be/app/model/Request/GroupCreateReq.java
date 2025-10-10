package khoindn.swp391.be.app.model.Request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import khoindn.swp391.be.app.model.formatReq.CoOwner_Info;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupCreateReq {

    @NotNull(message = "Vehicle ID cannot be null")
    private Integer vehicleId;

    @NotNull(message = "Member list cannot be null")
    @Size(min = 1, message = "At least one co-owner is required")
    private List<CoOwner_Info> member;

    @NotNull(message = "Role in group cannot be null")
    private String roleInGroup;
}

