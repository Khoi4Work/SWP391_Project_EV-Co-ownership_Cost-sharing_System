package khoindn.swp391.be.app.pojo;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;


@Entity // Changed from [user] to Users
@Getter
@Setter
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

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


    @ManyToOne
    @JoinColumn(name = "Role_ID", nullable = false)
    private UserRole role_id; // Default role ID for regular users


    public Users() {
    }

    public Users(String hovaTen, String email, String password, String cccd, String gplx, UserRole role) {
        this.hovaTen = hovaTen;
        this.email = email;
        this.password = password;
        this.cccd = cccd;
        this.gplx = gplx;

    }




}
