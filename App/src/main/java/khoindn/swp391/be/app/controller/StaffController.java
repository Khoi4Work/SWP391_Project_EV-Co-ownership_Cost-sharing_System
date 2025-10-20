package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.UpdateRequestGroup;
import khoindn.swp391.be.app.pojo.RequestGroup;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.AuthenticationService;
import khoindn.swp391.be.app.service.GroupService;
import khoindn.swp391.be.app.service.IGroupService;
import khoindn.swp391.be.app.service.IRequestGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff")
@SecurityRequirement(name = "api")
public class StaffController {
    @Autowired
    private IGroupService iGroupService;
    @Autowired
    private IRequestGroupService iRequestGroupService;
    private AuthenticationService authenticationService;

    @PostMapping("/delete-group")
    public void deleteGroup(@RequestParam int groupId) {
        iGroupService.deleteGroup(groupId);
    }

    @GetMapping("/get/all/request-group")
    public ResponseEntity getAllRequestGroup() {
        List<RequestGroup> res = iRequestGroupService.getAllRequestGroup();
        if (res.isEmpty()) {
            return ResponseEntity.status(204).body("No Content");
        }
        return ResponseEntity.status(200).body(res);
    }

    @PostMapping("/update/request-group")
    public ResponseEntity updateRequestGroup(@RequestBody @Valid UpdateRequestGroup update) {
        Users staff = authenticationService.getCurrentAccount();
        if (!staff.getRole().getRoleName().equalsIgnoreCase("staff")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        iRequestGroupService.updateRequestGroup(update);


        return ResponseEntity.status(200).body("Update successfully");
    }


}
