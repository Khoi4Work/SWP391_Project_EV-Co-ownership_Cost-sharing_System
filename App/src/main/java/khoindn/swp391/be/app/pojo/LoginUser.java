package khoindn.swp391.be.app.pojo;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import khoindn.swp391.be.app.pojo.UserRole;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class LoginUser {
    @Email
    private String email;

    @NotBlank
    private String password;

    public LoginUser(String password, String email) {
        this.password = password;
        this.email = email;
    }
}
