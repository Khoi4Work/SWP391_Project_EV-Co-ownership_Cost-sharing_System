package khoindn.swp391.be.app.controller;


import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Users")
@RequiredArgsConstructor

public class LoginController {
 private final IAuthenticationRepository iAuthenticationRepository;
 @PostMapping("/login")
 public ResponseEntity<String> login(@RequestBody Users user ) {
     return iAuthenticationRepository.findByEmailAndPassword(user.getEmail(),user.getPassword())
             .map(u-> ResponseEntity.ok("Login successful"))
             .orElse(ResponseEntity.status(401).body("Invalid email or password"));
 }
}
