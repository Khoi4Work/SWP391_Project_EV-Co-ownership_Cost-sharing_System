package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class RequestService {

    //attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true)
    private String serviceName;
    @Column(name = "description", unique = true)
    private String description;
    @Column(name = "price")
    private Double price;
    @Column(name = "status")
    private String status; // pending, in_progress, completed
    @Column(name = "created_at")
    private LocalDateTime createdAt;


    //relationship

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "group_member_id")
    private GroupMember groupMember;

}
