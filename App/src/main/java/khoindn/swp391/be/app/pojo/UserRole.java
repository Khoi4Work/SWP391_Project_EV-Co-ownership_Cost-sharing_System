package khoindn.swp391.be.app.pojo;



import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRole {
    // attributes
    @Id
    @Column
    private int roleId;
    @Column(unique = true)
    private String roleName;

    // relationship
    @OneToMany(mappedBy = "hovaTen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Users> users = new ArrayList<>();
}
