package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.AddMemberRequest;
import khoindn.swp391.be.app.model.Response.GroupMemberResponse;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.service.IGroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    @PostMapping(
            path = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<GroupMemberResponse> addMember(
            @RequestParam("groupId") int groupId,
            @Valid @RequestBody AddMemberRequest req) {

        GroupMember saved = groupMemberService.addMemberToGroup(
                groupId, req.getUserId(), req.getRoleInGroup(), req.getOwnershipPercentage());

        GroupMemberResponse body = new GroupMemberResponse(
                saved.getId(),
                saved.getGroup().getGroupId(),
                saved.getUsers().getId(),
                saved.getRoleInGroup(),
                saved.getStatus(),
                saved.getCreatedAt(),
                saved.getOwnershipPercentage()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }



}
