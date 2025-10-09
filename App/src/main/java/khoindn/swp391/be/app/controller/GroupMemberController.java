package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.service.IGroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/groupMember")
@SecurityRequirement(name = "api")
public class GroupMemberController {
    @Autowired
    private IGroupMemberService groupMemberService;
    @GetMapping("/getByUserId")
    public ResponseEntity<?> getGroupMembersByUserId(@RequestParam("userId") int userId) {
        return ResponseEntity.ok(groupMemberService.findAllByUsersId(userId));
    }
}
