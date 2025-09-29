package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.pojo.Users;
import org.springframework.context.annotation.Bean;

import java.util.Optional;

public interface IAuthenticationService {
    public Optional<Users> findByEmailAndPassword(String email, String password);
}
