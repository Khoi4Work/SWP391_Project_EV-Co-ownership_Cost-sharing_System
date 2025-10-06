package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.UserNotFoundException;
import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private ModelMapper modelMapper;

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
        if (!iUserRepository.existsById(id)) {
            throw new UserNotFoundException("User with id " + id + " not found");
        }
        iUserRepository.deleteById(id);
    }

    @Override
    public Users updateUser(Users users, int id) {
        Users u = iUserRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        u.setEmail(users.getEmail());
        u.setPassword(users.getPassword());
        u.setHovaTen(users.getHovaTen());
        u.setCccd(users.getCccd());
        u.setGplx(users.getGplx());
        u.setRole(users.getRole());

        return iUserRepository.save(u);
    }

    @Override
    public Users getUserByEmail(String email) {
        Users user = iUserRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User with email " + email + " not found");
        }
        return user;
    }


}
