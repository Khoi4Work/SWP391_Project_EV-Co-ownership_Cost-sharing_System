package khoindn.swp391.be.app.pojo;



import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRole {
    @Id
    @Column
    private int role_id;
    @Column(unique = true)
    private String roleName;
    @OneToMany(mappedBy = "role_id", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<Users> users;

}
