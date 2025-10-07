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
    private int roleId;
    @Column(unique = true)
    private String roleName;


}
