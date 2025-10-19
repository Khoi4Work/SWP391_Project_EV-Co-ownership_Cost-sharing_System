package khoindn.swp391.be.app.model.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractCreateReq {


    @NotBlank(message = "Can't get url!!")
    private String documentUrl;
    @NotBlank(message = "Can't get contractType!!")
    private String contractType;
    @NotEmpty(message = "UserId list cannot be empty")
    public List<Integer> userId;

}
