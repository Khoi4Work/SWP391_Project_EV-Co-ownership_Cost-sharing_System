package khoindn.swp391.be.app.model.Request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecisionVoteReq {

    @NotNull
    private Integer idService;

    @NotEmpty
    @Size(min = 1, max = 50)
    private List<String> decisionNames; // maintenance, repair, upgrade,... or others

    @Size(min = 1, max = 50)
    private String description;

    @Positive
    private long price;

    @NotNull
    private MultipartFile billImage;

}
