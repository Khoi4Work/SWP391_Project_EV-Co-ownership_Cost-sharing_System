package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.service.IGroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/groupMember")
@SecurityRequirement(name = "api")
public class GroupMemberController {
    @Autowired
    private IGroupMemberService groupMemberService;

    @GetMapping("/getByUserId")
    public ResponseEntity<List<GroupMember>> getGroupMembersByUserId(@RequestParam("userId") int userId) {
        List<GroupMember> groupMember = groupMemberService.findAllByUsersId(userId);
        return ResponseEntity.ok(groupMember);
    }
}
