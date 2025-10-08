package khoindn.swp391.be.app.pojo;
import jakarta.persistence.*;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_signers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractSigner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;


    @Column(name = "decision")
    private String decision; // pending | signed | declined

    @Column(name = "signed_at")
    private LocalDateTime signedAt;
}
