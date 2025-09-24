package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.pojo.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IAuthenticationRepository extends JpaRepository<Users, Integer> {
    Users findUsersByEmail(String email);


}
