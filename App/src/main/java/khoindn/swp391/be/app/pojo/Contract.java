package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    // Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int contractId;
    private String contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status; // pending, active, decline
    @Column(name = "content_string", length = 5000)
    private String htmlString; // link PDF do FE render

    // Relationships
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}
