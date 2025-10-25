package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_in")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int checkInId;
    private String condition;
    private String notes;
    private String images;
    private LocalDateTime checkInTime = LocalDateTime.now();
    // relationships
    @OneToOne
    @JoinColumn(name = "schedule_id", nullable = false, unique = true)
    private Schedule schedule;


}
