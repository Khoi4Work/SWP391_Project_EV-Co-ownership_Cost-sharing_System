package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_out")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckOut {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int checkOutId;
    private String condition;
    private String notes;
    private String images;
    private LocalDateTime checkOutTime = LocalDateTime.now();
    @OneToOne
    @JoinColumn(name = "schedule_id", nullable = false, unique = true)
    private Schedule schedule;


}
