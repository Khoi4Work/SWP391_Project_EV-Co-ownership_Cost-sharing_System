package khoindn.swp391.be.app.pojo;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


@Entity // Changed from [user] to Users
@Data
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class Users implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    @NotNull
    private String hovaTen;  // Changed to match Java naming conventions

    @Column(name = "Email",
            nullable = false,
            unique = true)
    @Email
    private String email;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "CCCD", nullable = false, unique = true)
    private String cccd;  // Changed to match Java naming conventions

    @Column(name = "GPLX", nullable = false, unique = true)
    private String gplx;  // Changed to match Java naming conventions

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private UserRole role; // Default role ID for regular users

    @OneToMany(mappedBy = "users")
    @JsonIgnore
    @ToString.Exclude
    private List<GroupMember> userOfGroupMember = new ArrayList<>();

    public Users(String hovaTen, String email, String password, String cccd, String gplx) {
        this.hovaTen = hovaTen;
        this.email = email;
        this.password = password;
        this.cccd = cccd;
        this.gplx = gplx;

    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
