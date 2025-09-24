package khoindn.swp391.be.app.controller;


import khoindn.swp391.be.app.model.loginRequest.LoginUser;
import khoindn.swp391.be.app.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")


public class LoginController {
    private final IAuthenticationService iAuthenticationService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginUser LoginUser) {
        return iAuthenticationService.findByEmailAndPassword(LoginUser.getEmail(), LoginUser.getPassword())
                .map(users -> ResponseEntity.ok("Login successful"))
                .orElse(ResponseEntity.status(401).body("Invalid email or password"));
    }
}
