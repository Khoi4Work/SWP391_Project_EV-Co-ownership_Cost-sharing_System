package khoindn.swp391.be.app.controller;


import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.LoginUser;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")


public class LoginController {
    @Autowired
    AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity register(@Valid @RequestBody Users users) {
        // get request from FE
        // send to AuthenticationService
        Users newAccount = authenticationService.register(users);
        return ResponseEntity.ok(newAccount);
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid LoginUser loginUser) {
        UsersResponse usersResponse = authenticationService.login(loginUser);
        return ResponseEntity.ok(usersResponse);
    }
}
