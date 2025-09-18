package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService implements IAuthenticationService {

    @Autowired
    private IAuthenticationRepository iAuthenticationRepository;

    @Override
    public Optional<Users> findByEmailAndPassword(String email, String password) {
        return iAuthenticationRepository.findByEmailAndPassword(email, password);
    }
}
