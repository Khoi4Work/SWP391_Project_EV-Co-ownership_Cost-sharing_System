package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.LeaveGroupReq;
import khoindn.swp391.be.app.model.Request.UpdateRequestGroup;
import khoindn.swp391.be.app.model.Response.ContractPendingRes;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.RequestGroup;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.*;
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
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IGroupMemberService iGroupMemberService;
    @Autowired
    private IContractService iContractService;

    // DELETE GROUP

    @PostMapping("/delete-group/{groupId}")
    public ResponseEntity deleteGroup(@PathVariable int groupId) {
        iGroupService.deleteGroup(groupId);
        return ResponseEntity.ok().body("Delete group successfully");
    }

    // LEAVE GROUP
    
    @PostMapping("leave-group")
    public ResponseEntity leaveGroup(LeaveGroupReq request) {
        Users staff = authenticationService.getCurrentAccount();
        if (!staff.getRole().getRoleName().equalsIgnoreCase("staff")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        GroupMember user_leaving = iGroupMemberService.leaveGroup(request);
        return ResponseEntity.status(HttpStatus.OK).body(user_leaving);
    }

    // GET ALL REQUEST GROUP

    @GetMapping("/get/all/request-group")
    public ResponseEntity getAllRequestGroup() {
        List<RequestGroup> res = iRequestGroupService.getAllRequestGroup();
        if (res.isEmpty()) {
            return ResponseEntity.status(204).body("No Content");
        }
        return ResponseEntity.status(200).body(res);
    }

    // UPDATE REQUEST GROUP

    @PostMapping("/update/request-group")
    public ResponseEntity updateRequestGroup(@RequestBody @Valid UpdateRequestGroup update) {
        Users staff = authenticationService.getCurrentAccount();
        if (!staff.getRole().getRoleName().equalsIgnoreCase("staff")) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        iRequestGroupService.updateRequestGroup(update);
        return ResponseEntity.status(200).body("Update successfully");
    }

    // 1. GET PENDING CONTRACTS

    @GetMapping("/contract/pending")
    public ResponseEntity getPendingContracts() {
        Users staff = authenticationService.getCurrentAccount();
        if (!staff.getRole().getRoleName().equalsIgnoreCase("staff")) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        List<ContractPendingRes> res = iContractService.getPendingContracts();
        if (res.isEmpty()) {
            return ResponseEntity.status(204).body("No Content");
        }
        return ResponseEntity.status(200).body(res);
    }

    // 2. APPROVE or REJECT CONTRACT AND SEND EMAIL RESULT TO CUSTOMER

    @PostMapping("/contract/{contractId}/{decision}")
    public ResponseEntity verifyContract(@PathVariable int contractId, @PathVariable int decision) {
        Users staff = authenticationService.getCurrentAccount();
        if (!staff.getRole().getRoleName().equalsIgnoreCase("staff")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        iContractService.verifyContract(contractId, decision);

        return ResponseEntity.status(200).body("Verify successfully");
    }



}
