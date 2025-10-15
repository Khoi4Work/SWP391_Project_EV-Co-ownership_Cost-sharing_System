package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestGroupDetail {

    // attributes
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private String status; // pending, approved, rejected

    // relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hovaTen")
    private Users user;

    @OneToOne
    @JoinColumn(name = "request_group_id")
    private RequestGroup requestGroup;

}
