package khoindn.swp391.be.app.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.LoginUser;
import khoindn.swp391.be.app.model.Request.RegisterUserReq;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class AuthenticationController {
    @Autowired
    AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<Users> register(@Valid @RequestBody RegisterUserReq users) {
        // send to AuthenticationService
        Users newAccount = authenticationService.register(users);
        System.out.println(newAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAccount);
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginUser loginUser) {
        UsersResponse usersResponse = authenticationService.login(loginUser);
        return ResponseEntity.ok(usersResponse);
    }
}
