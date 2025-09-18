package khoindn.swp391.be.app.controller;


import jakarta.validation.Valid;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import khoindn.swp391.be.app.service.IAuthenticationService;
import khoindn.swp391.be.app.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Users")
@RequiredArgsConstructor

public class LoginController {

    @Autowired
    private IAuthenticationService iAuthenticationService;

    @PostMapping("/login")
    public ResponseEntity<String> login( String userEmail, String userPassword) {

        return ResponseEntity.ok(iAuthenticationService.findByEmailAndPassword(userEmail, userPassword)
                .map(users -> "Login successful")
                .orElse("Invalid email or password"));
    }
}
