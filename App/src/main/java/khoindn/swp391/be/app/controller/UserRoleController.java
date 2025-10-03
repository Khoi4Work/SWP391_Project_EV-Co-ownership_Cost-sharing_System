package khoindn.swp391.be.app.controller;



import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.service.IUserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/UserRole")
public class UserRoleController {


    @Autowired
    private IUserRoleService iUserRoleService;

    @PostMapping("/")
    public ResponseEntity<UserRole> addUserRole(@RequestBody UserRole userRole) {
        UserRole created = iUserRoleService.addUserRole(userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201 CREATED
    }

}
