package khoindn.swp391.be.app.model.formatReq;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoOwner_Info {

    private int contractId;
    @NotNull
    private float ownershipPercentage;
}
