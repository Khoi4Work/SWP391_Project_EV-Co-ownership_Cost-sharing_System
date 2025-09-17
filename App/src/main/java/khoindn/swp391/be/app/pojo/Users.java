package khoindn.swp391.be.app.pojo;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity // Changed from [user] to Users
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

    @Column(name = "Role_ID", nullable = false)
    private int role_id; // Default role ID for regular users

    public Users() {
    }

    public Users(int id,
                 String hovaTen,
                 String email,
                 String password,
                 String cccd,
                 String gplx) {
        this.id = id;
        this.hovaTen = hovaTen;
        this.email = email;
        this.password = password;
        this.cccd = cccd;
        this.gplx = gplx;

    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getHovaTen() {
        return hovaTen;
    }

    public void setHovaTen(String hovaTen) {
        this.hovaTen = hovaTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCccd() {
        return cccd;
    }

    public void setCccd(String cccd) {
        this.cccd = cccd;
    }

    public String getGplx() {
        return gplx;
    }

    public void setGplx(String gplx) {
        this.gplx = gplx;
    }


}
