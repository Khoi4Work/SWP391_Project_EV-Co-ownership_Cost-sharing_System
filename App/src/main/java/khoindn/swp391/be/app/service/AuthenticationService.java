package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.LoginUser;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService implements UserDetailsService {
    @Autowired
    private IAuthenticationRepository iAuthenticationRepository;
    @Autowired
    private IUserRepository iUserRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    ModelMapper modelMapper;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return iAuthenticationRepository.findUsersByEmail(email);
    }

    public Users register(Users users) {
        //process login from register controller
        users.setPassword(passwordEncoder.encode(users.getPassword()));
        //encode old password to new password
        // save to DB
        return iAuthenticationRepository.save(users);
    }

    public UsersResponse login(LoginUser loginUser) {
        // logic and authorized

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUser.getEmail()
                        , loginUser.getPassword()));
        Users users = (Users) authentication.getPrincipal();
        //map account --> accountResponse
        UsersResponse accountResponse = modelMapper.map(users, UsersResponse.class);
//        String token = tokenService.generateToken(account);
//        accountResponse.setToken(token);
        return accountResponse;
    }


}
