package khoindn.swp391.be.app.controller;

import jakarta.validation.Valid;
import khoindn.swp391.be.app.exception.exceptions.UserIsExistedException;
import khoindn.swp391.be.app.model.Request.RegisterUserReq;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/exception")
@CrossOrigin(origins = "http://localhost:8081")
public class ExceptionController {
    @Autowired
    private  AuthenticationService authenticationService;


    @GetMapping("/check/register")
    public ResponseEntity checkDataRegister(@Valid RegisterUserReq data) {
        Users user = authenticationService.checkDataRegister(data);
        if (user != null) {
            throw new UserIsExistedException("User is existed!");
        }
        return ResponseEntity.status(200).body("Valid user registration");
    }
}
