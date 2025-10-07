package khoindn.swp391.be.app.model.Request;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import khoindn.swp391.be.app.pojo.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.management.relation.Role;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserReq {

    private String hovaTen;  // Changed to match Java naming conventions

    @Email
    private String email;

    private String password;

    private String cccd;  // Changed to match Java naming conventions

    private String gplx;  // Changed to match Java naming conventions

    private String phone;

    private UserRole roleId; // Default role ID for regular users
}
