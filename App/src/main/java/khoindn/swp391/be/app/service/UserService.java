package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private IUserRepository iUserRepository;

    @Override
    public Optional<Users> findUserById(int id) {
        return iUserRepository.findById(id);
    }

    @Override
    public Users addUser(Users users) {
        return iUserRepository.save(users);
    }

    @Override
    public void deleteUser(int id) {
        iUserRepository.deleteById(id);
    }

    @Override
    public Users updateUser(Users users, int id) {
        Users u = iUserRepository.getReferenceById(id);
        if (u != null) {
            u.setEmail(users.getEmail());
            u.setPassword(users.getPassword());
            u.setHovaTen(users.getHovaTen());
            u.setCccd(users.getCccd());
            u.setGplx(users.getGplx());
            u.setRole(users.getRole());
        }
        return null;
    }
}
