package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.service.AuthenticationService;
import khoindn.swp391.be.app.service.IContractService;
import khoindn.swp391.be.app.service.IGroupMemberService;
import khoindn.swp391.be.app.service.IVehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;



@RestController
@RequestMapping("/contract")
@SecurityRequirement(name = "api")

public class ContractController {

    @Autowired
    private IContractService iContractService;

    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IGroupMemberService iGroupMemberService;
    @Autowired
    private IVehicleService iVehicleService;
    @Autowired
    private SpringTemplateEngine templateEngine;

    // Lấy contract
    @GetMapping("/user/{id}")
    public ResponseEntity<Contract> getContractByContractId(@PathVariable int id) {
        Contract contract = iContractService.getContractByContractId(id);
        if (contract == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(contract);
    }

    // Tạo/Set contract
    @PostMapping("/set")
    public ResponseEntity<ContractSigner> setContract(@RequestBody @Valid ContractDecisionReq req) {
        ContractSigner contractResult = iContractService.setContract(req);
        if (contractResult == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(contractResult);
    }

    // Gửi email
    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody SendEmailReq emailReq) {
        try {
            iContractService.SendBulkEmail(emailReq);
            return ResponseEntity.status(HttpStatus.OK).body("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<List<ContractSigner>> createContract(@RequestBody @Valid ContractCreateReq req) {
        System.out.println(req);
        List<ContractSigner> contractResult = iContractService.createContract(req);
        if (contractResult == null) {
            throw new RuntimeException("Failed to create contract");
        }
        System.out.println(contractResult);
        return ResponseEntity.status(HttpStatus.CREATED).body(contractResult);
    }

    @GetMapping("/user/current")
    public ResponseEntity<Contract> getContractsByUserCurrent() {
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Contract contract = iContractService.getContractByContractId(user.getId());
        return ResponseEntity.status(HttpStatus.OK).body(contract);
    }

    @GetMapping("/history")
    public ResponseEntity<ContractHistoryRes> getHistoryContractsByUser() {
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ContractHistoryRes res = iContractService.getHistoryContractsByUser(user);
        if (res == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.status(HttpStatus.FOUND).body(res);
    }

    @GetMapping("/preview")
    public ResponseEntity<String> renderContract(@RequestParam("contractId") int contractId) {
        // Lay nguoi dung hien tai
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Lay contract dang muon view
        Contract contract = iContractService.getContractByContractId(contractId);
        if (contract == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // Lay xe
        Vehicle vehicle = iVehicleService.findVehicleByGroupId(contract.getGroup().getGroupId());
        // Lay tat ca thanh vien
        if (vehicle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        //Lay tat ca thanh vien co trong group
        List<GroupMember> allmembers = iGroupMemberService.getMembersByGroupId(contract.getGroup().getGroupId());
        //Lay owner
        GroupMember owner = allmembers.stream()
                .max(Comparator.comparing(GroupMember::getOwnershipPercentage))
                .orElse(null);
        if (owner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        //Lay coOwner
        List<GroupMember> coOwners = allmembers.stream()
                .filter(member -> !member.getUsers().getId().equals(owner.getUsers().getId()))
                .toList();


//        ModelAndView mav = new ModelAndView("contract-preview"); // file contract-preview.html

        // Dữ liệu mẫu
//        mav.addObject("ownerName", owner.getUsers().getHovaTen());
//        mav.addObject("ownerEmail", owner.getUsers().getEmail());
//        mav.addObject("ownerShare", owner.getOwnershipPercentage());
//        mav.addObject("vehicleModel", vehicle.getModel());
//        mav.addObject("vehiclePlate", vehicle.getPlateNo());
//        mav.addObject("coOwners", coOwners.stream()
//                .map(member -> Map.of(
//                        "name", member.getUsers().getHovaTen(),
//                        "share", member.getOwnershipPercentage()
//                ))
//                .toList());
//        mav.addObject("status", contract.getStatus());

        Context context = new Context();
        context.setVariable("ownerName", owner.getUsers().getHovaTen());
        context.setVariable("ownerEmail", owner.getUsers().getEmail());
        context.setVariable("ownerShare", owner.getOwnershipPercentage());
        context.setVariable("vehicleModel", vehicle.getModel());
        context.setVariable("vehiclePlate", vehicle.getPlateNo());
        context.setVariable("coOwners", coOwners.stream()
                .map(member -> Map.of("name", member.getUsers().getHovaTen(), "share", member.getOwnershipPercentage()))
                .toList());
        context.setVariable("status", contract.getStatus());

        // render thymeleaf template to HTML string
        String html = templateEngine.process("contract-preview", context);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }
}
