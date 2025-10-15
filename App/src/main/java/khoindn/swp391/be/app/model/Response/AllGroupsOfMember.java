package khoindn.swp391.be.app.model.Response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.RequestGroup;
import khoindn.swp391.be.app.pojo.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllGroupsOfMember {
    private String roleInGroup;
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();
    private float ownershipPercentage;
    private Group group;
    private List<RequestGroup> requestGroups = new ArrayList<>();
}
