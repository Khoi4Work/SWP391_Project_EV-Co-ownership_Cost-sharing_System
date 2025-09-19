package khoindn.swp391.be.app.controller;

import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.IUserRoleService;
import khoindn.swp391.be.app.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/UserRole")
public class UserRoleController {
    @Autowired
    private IUserRoleService iUserService;

    @PostMapping("/")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserRole> addUser(@RequestBody UserRole userRole) {
        return ResponseEntity.ok(iUserService.addUserRole(userRole));
    }
}
