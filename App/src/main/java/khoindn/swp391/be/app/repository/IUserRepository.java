package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Users;
import org.springframework.data.jpa.repository.JpaRepository;


public interface IUserRepository extends JpaRepository<Users, Integer> {
}
