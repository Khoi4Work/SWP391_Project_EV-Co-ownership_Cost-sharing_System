package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    // attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int scheduleId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    @Column(nullable = false)
    private String status;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // relationship
    @ManyToOne
    @JoinColumn(name = "group_member_id", nullable = false)
    private GroupMember groupMember;

}
