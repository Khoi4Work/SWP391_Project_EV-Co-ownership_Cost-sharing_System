package khoindn.swp391.be.app.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Group {
    // Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private int groupId;
    @Column(name = "group_name", length = 100, nullable = false)
    private String groupName;
    @Column(length = 255)
    private String description;
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column
    private String status = "active"; // active by default
    // Relationships
    @OneToMany(mappedBy = "group")
    @JsonIgnore
    private List<GroupMember> groupMembers = new ArrayList<>();
    @OneToMany(mappedBy = "group")
    @JsonIgnore
    private  List<Vehicle> vehicles = new ArrayList<>();

}
