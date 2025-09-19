package khoindn.swp391.be.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import khoindn.swp391.be.app.pojo.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginUser {
    @Email
    private String email;

    @NotBlank
    private String password;
}
