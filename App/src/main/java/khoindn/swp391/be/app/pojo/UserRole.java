package khoindn.swp391.be.app.pojo;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table

@Getter
@Setter
public class UserRole {
    @Id

    @Column
    private int role_id;
    @Column(unique = true)
    private String roleName;

    public UserRole() {
    }

    public UserRole(int role_id, String roleName) {
        this.role_id = role_id;
        this.roleName = roleName;
    }
}
