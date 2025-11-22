package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.exception.exceptions.GroupMemberNotFoundException;
import khoindn.swp391.be.app.model.Request.AddMemberRequest;
import khoindn.swp391.be.app.model.Request.DecisionVoteReq;
import khoindn.swp391.be.app.model.Request.VotingRequest;
import khoindn.swp391.be.app.model.Response.DecisionVoteRes;
import khoindn.swp391.be.app.model.Response.GroupMemberDetailRes;
import khoindn.swp391.be.app.model.Response.GroupMemberResponse;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.OptionDecisionVoteDetail;
import khoindn.swp391.be.app.repository.IDecisionVoteDetailRepository;
import khoindn.swp391.be.app.repository.IDecisionVoteRepository;
import khoindn.swp391.be.app.service.AuthenticationService;
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
@CrossOrigin(origins = "http://localhost:8081")
public class GroupMemberController {

    @Autowired
    private IGroupMemberService iGroupMemberService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IGroupService iGroupService;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IDecisionVoteDetailRepository iDecisionVoteDetailRepository;
    @Autowired
    private IDecisionVoteRepository iDecisionVoteRepository;

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

//    // ---------------------- NEW CODE: Add member to group ----------------------
//    @PostMapping("/add")
//    public ResponseEntity<GroupMemberResponse> addMember(
//            @RequestParam("groupId") int groupId,
//            @Valid @RequestBody AddMemberRequest req) {
//
//        GroupMember saved = iGroupMemberService.addMemberToGroup(
//                groupId, req.getUserId(), req.getRoleInGroup(), req.getOwnershipPercentage());
//        if (saved == null) {
//            return ResponseEntity.badRequest().build();
//        }
//        GroupMemberResponse body = new GroupMemberResponse(
//                saved.getId(),
//                saved.getGroup(),
//                saved.getUsers(),
//                saved.getRoleInGroup(),
//                saved.getStatus().name(),
//                saved.getCreatedAt(),
//                saved.getOwnershipPercentage()
//        );
//        if (body == null) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
//        }
//
//        return ResponseEntity.status(HttpStatus.CREATED).body(body);
//    }


    @GetMapping("/members/{groupId}")
    public ResponseEntity getMembersByGroupId(@PathVariable int groupId) {
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

    @PostMapping(value = "/decision/group/{idGroup}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity createDecision(@PathVariable int idGroup, @ModelAttribute @Valid DecisionVoteReq request) {
        // Get current user
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        // Check if user is member of group
        System.out.println(user.getId()+"-"+idGroup);
        GroupMember gm = iGroupMemberService.getGroupOwnerByGroupIdAndUserId(idGroup, user.getId());
        if (gm == null) {
            throw new GroupMemberNotFoundException("Member is not in Group!");
        }
        // Create decision
        DecisionVoteRes res = iGroupMemberService.createDecision(request, gm);
        if (res == null) {
            return ResponseEntity.status(500).body("INTERNAL SERVER ERROR");
        }
        return ResponseEntity.status(201).body(res);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMemberDetailRes>> getGroupMembersByGroupId(@PathVariable int groupId) {
        List<GroupMemberDetailRes> members = iGroupMemberService.getGroupMembersByGroupId(groupId);
        return ResponseEntity.ok(members);
    }

    @PatchMapping("/decision")
    public ResponseEntity setDecision(@RequestBody VotingRequest votingRequest) {
        Users user = authenticationService.getCurrentAccount();
        System.out.println(user);
        if (user == null) {
            return ResponseEntity.status(403).body("Unauthorized");
        }


        System.out.println(votingRequest.getGroupId());
        GroupMember groupMember = iGroupMemberService.getGroupOwnerByGroupIdAndUserId(votingRequest.getGroupId(), user.getId());
        if (groupMember == null) {
            throw new GroupMemberNotFoundException("Member is not in Group!");
        }
        DecisionVoteDetail voter = iGroupMemberService
                .getDecisionVoteDetailByGroupMemberAndDecision(groupMember, votingRequest.getDecisionId());
        if (!voter.getOptionDecisionVote().equals(OptionDecisionVoteDetail.ABSENT)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("You have already voted for this decision.");
        }

        DecisionVote vote = iGroupMemberService.setDecision(
                votingRequest.getVote(),
                votingRequest.getDecisionId(),
                votingRequest.getServiceId(),
                groupMember);

        return ResponseEntity.status(200).body(vote);
    }

    @GetMapping("/decision/vote/detail/{id}")
    public ResponseEntity getDecisionVoteDetail(@PathVariable long id) {
        DecisionVote decisionVote = iGroupMemberService.getDecisionVoteById(id);
        System.out.println("DECISION VOTE"+decisionVote);
        System.out.println("DECISION VOTE DETAIL"+iGroupMemberService.getAllDecisionVoteDetailByDecisionVote(decisionVote));
        return ResponseEntity.status(200).body(iGroupMemberService.getAllDecisionVoteDetailByDecisionVote(decisionVote));
    }

    @GetMapping("/decision/{id}")
    public ResponseEntity getDecision(@PathVariable long id) {
        return ResponseEntity.status(200).body(iGroupMemberService.getDecisionVoteById(id));
    }
}
