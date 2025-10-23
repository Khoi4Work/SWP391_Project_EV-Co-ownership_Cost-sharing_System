package khoindn.swp391.be.app.model.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponse {
    private int id;
    private int groupId;
    private int userId;
    private String roleInGroup;
    private String status;
    private LocalDateTime createdAt;
    private float ownershipPercentage;
}
