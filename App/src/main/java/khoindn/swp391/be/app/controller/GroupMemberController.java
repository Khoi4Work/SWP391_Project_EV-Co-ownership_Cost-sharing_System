package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.AddMemberRequest;
import khoindn.swp391.be.app.model.Response.GroupMemberResponse;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.service.IGroupMemberService;
import khoindn.swp391.be.app.service.IGroupService;
import org.modelmapper.ModelMapper;
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
    private IGroupMemberService iGroupMemberService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IGroupService iGroupService;

    // ---------------------- EXISTING CODE ----------------------
    @GetMapping("/getByUserId")
    public ResponseEntity<List<GroupMember>> getGroupMembersByUserId(@RequestParam("userId") int userId) {
        List<GroupMember> groupMember = iGroupMemberService.findAllByUsersId(userId);
        return ResponseEntity.ok(groupMember);
    }

    @GetMapping("/getGroupIdsByUserId")
    public ResponseEntity<List<Integer>> getGroupIdsByUserId(@RequestParam("userId") int userId) {
        List<Integer> groupIds = iGroupMemberService.getGroupIdsByUserId(userId);
        return ResponseEntity.ok(groupIds);
    }

    // ---------------------- NEW CODE: Add member to group ----------------------
    @PostMapping(
            path = "/add"
    )
    public ResponseEntity<GroupMemberResponse> addMember(
            @RequestParam("groupId") int groupId,
            @Valid @RequestBody AddMemberRequest req) {

        GroupMember saved = iGroupMemberService.addMemberToGroup(
                groupId, req.getUserId(), req.getRoleInGroup(), req.getOwnershipPercentage());
        if (saved == null) {
            return ResponseEntity.badRequest().build();
        }
        GroupMemberResponse body = new GroupMemberResponse(
                saved.getId(),
                saved.getGroup(),
                saved.getUsers(),
                saved.getRoleInGroup(),
                saved.getStatus(),
                saved.getCreatedAt(),
                saved.getOwnershipPercentage()
        );
        if (body == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }


    @GetMapping("/members/{groupId}")
    public ResponseEntity getMembersByGroupId(@PathVariable int groupId){
        Group group = iGroupService.getGroupById(groupId);
        List<GroupMemberResponse> allMembers = iGroupMemberService.getMembersByGroupId(groupId).stream()
                .map(groupMember -> modelMapper.map(groupMember, GroupMemberResponse.class))
                .toList();
        if (allMembers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No members found for groupId: " + group.getGroupName());
        }

        return ResponseEntity.status(HttpStatus.OK).body(allMembers);
    }


}
