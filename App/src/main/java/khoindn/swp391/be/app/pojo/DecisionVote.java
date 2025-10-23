package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecisionVote{

    // Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "decision_name", unique = true)
    private String decisionName; // maintenance, repair, upgrade,... or others
    @Column(name = "description")
    private String description;
    @Column(name = "status")
    private String status = "pending"; // pending, approved, rejected
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relationships
    @ManyToOne
    @JoinColumn(name = "created_by")
    private GroupMember createdBy;
}
