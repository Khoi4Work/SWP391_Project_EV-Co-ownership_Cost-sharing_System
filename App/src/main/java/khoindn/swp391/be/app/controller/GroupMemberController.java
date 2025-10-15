package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.service.IGroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groupMember")
@SecurityRequirement(name = "api")
public class GroupMemberController {

    @Autowired
    private IGroupMemberService groupMemberService;

    // ---------------------- EXISTING CODE ----------------------
    @GetMapping("/getByUserId")
    public ResponseEntity<List<GroupMember>> getGroupMembersByUserId(@RequestParam("userId") int userId) {
        List<GroupMember> groupMember = groupMemberService.findAllByUsersId(userId);
        return ResponseEntity.ok(groupMember);
    }

    @GetMapping("/getGroupIdsByUserId")
    public ResponseEntity<List<Integer>> getGroupIdsByUserId(@RequestParam("userId") int userId) {
        List<Integer> groupIds = groupMemberService.getGroupIdsByUserId(userId);
        return ResponseEntity.ok(groupIds);
    }

    // ---------------------- NEW CODE: Add member to group ----------------------
    @PostMapping("/add")
    public ResponseEntity<GroupMember> addMember(
            @RequestParam("groupId") int groupId,
            @RequestBody GroupMember request
    ) {
        GroupMember saved = groupMemberService.addMemberToGroup(
                groupId,
                request.getUsers().getId(),
                request.getRoleInGroup(),
                request.getOwnershipPercentage()
        );
        return ResponseEntity.ok(saved);
    }


}
