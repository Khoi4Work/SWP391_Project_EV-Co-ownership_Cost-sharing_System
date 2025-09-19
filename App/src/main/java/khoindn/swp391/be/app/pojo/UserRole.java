package khoindn.swp391.be.app.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class UserRole {
    @Id
    private int roleID;
    @Column(nullable = false, unique = true, length = 50)
    private String roleName;
    public UserRole() {
    }

    public UserRole(int roleID, String roleName) {
        this.roleID = roleID;
        this.roleName = roleName;
    }
}
