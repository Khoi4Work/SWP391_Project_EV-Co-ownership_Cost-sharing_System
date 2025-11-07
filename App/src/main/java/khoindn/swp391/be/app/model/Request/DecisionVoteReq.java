package khoindn.swp391.be.app.model.Request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecisionVoteReq {

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
