package khoindn.swp391.be.app.model.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterVehicleReq {

    private List<@Email String> email;
    @NotNull
    private int vehicleId;
    @NotNull
    private float ownership_percentage;

}
