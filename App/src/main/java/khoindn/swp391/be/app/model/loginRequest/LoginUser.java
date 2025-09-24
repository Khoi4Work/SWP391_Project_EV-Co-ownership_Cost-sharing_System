package khoindn.swp391.be.app.model.loginRequest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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
