package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.CCCDDuplicatedException;
import khoindn.swp391.be.app.exception.exceptions.EmailDuplicatedException;
import khoindn.swp391.be.app.exception.exceptions.GPLXDuplicatedException;
import khoindn.swp391.be.app.exception.exceptions.PhoneDuplicatedException;
import khoindn.swp391.be.app.model.Request.LoginUser;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import khoindn.swp391.be.app.repository.IUserRoleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    @Autowired
    TokenService tokenService;
    @Autowired
    private IUserRoleRepository iUserRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = iAuthenticationRepository.findUsersByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return user;
    }

    public Users register(Users users) {
        // Kiểm tra email
        if (iAuthenticationRepository.existsByEmail((users.getEmail()))){
            throw new EmailDuplicatedException("Email đã được sử dụng");
        }

        // Kiểm tra CCCD
        if (iAuthenticationRepository.existsByCccd((users.getCccd()))){
            throw new CCCDDuplicatedException("CCCD đã được sử dụng");
        }

        // Kiểm tra GPLX
        if (iAuthenticationRepository.existsByGplx((users.getGplx()))){
            throw new GPLXDuplicatedException("GPLX đã được sử dụng");
        }

        // Kiểm tra phone
        if (iAuthenticationRepository.existsByPhone((users.getPhone()))){
            throw new PhoneDuplicatedException( "Số điện thoại đã được sử dụng");

        }

        //process login from register controller
        users.setPassword(passwordEncoder.encode(users.getPassword()));
        users.setRole(iUserRoleRepository.findUserRoleByRoleId(users.getRole().getRoleId()));
        //encode old password to new password
        // save to DB
        return iAuthenticationRepository.save(users);
    }

    public UsersResponse login(LoginUser loginUser) {
        // logic and authorized

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginUser.getEmail(),
                        loginUser.getPassword()));
        Users users = (Users) authentication.getPrincipal();
        if (loginUser.getRoleId() != null && !loginUser.getRoleId().equals(users.getRole().getRoleId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sai loại tài khoản");
        }
        //map account --> accountResponse
        UsersResponse usersResponse = modelMapper.map(users, UsersResponse.class);
        String token = tokenService.generateToken(users);
        usersResponse.setToken(token);
        return usersResponse;
    }


}
