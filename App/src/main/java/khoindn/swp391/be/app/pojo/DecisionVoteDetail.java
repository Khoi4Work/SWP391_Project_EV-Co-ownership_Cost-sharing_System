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
public class DecisionVoteDetail {

    // Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "optionVote")
    private String option = "absent";

    @Column(name = "voted_at")
    private LocalDateTime votedAt = LocalDateTime.now();

    // Relationships
    @ManyToOne
    @JoinColumn(name = "voter_id")
    private GroupMember groupMember;


}
