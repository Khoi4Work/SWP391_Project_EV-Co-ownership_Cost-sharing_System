package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class RequestServiceDetail {

    // Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "status")
    private String status = "pending"; // pending, in_progress, completed
    @Column(name = "description")
    private String description;
    // Relationships
    @OneToOne
    @JoinColumn(name = "request_service_id")
    private RequestService request;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Users staff;
}
