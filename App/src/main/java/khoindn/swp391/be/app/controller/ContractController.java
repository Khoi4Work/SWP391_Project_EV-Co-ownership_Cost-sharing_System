package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.*;

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
    @Autowired
    private IEmailService iEmailService;

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
            iEmailService.SendBulkEmail(emailReq);
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
    public ResponseEntity<List<ContractHistoryRes>> getHistoryContractsByUser() {
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ContractHistoryRes> res = iContractService.getHistoryContractsByUser(user)
                .stream()
                .filter(contractHistory ->
                        contractHistory.getStatus().equalsIgnoreCase("activated"))
                .toList();
        if (res == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/preview")
    public ResponseEntity<String> renderContract(@RequestParam("contractId") int contractId) {
        // ✅ Lấy người dùng hiện tại
        Users user = authenticationService.getCurrentAccount();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // ✅ Lấy hợp đồng
        Contract contract = iContractService.getContractByContractId(contractId);
        if (contract == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy hợp đồng.");
        }

        // ✅ Lấy xe
        Vehicle vehicle = iVehicleService.findVehicleByGroupId(contract.getGroup().getGroupId());
        if (vehicle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy xe thuộc nhóm này.");
        }

        // ✅ Lấy danh sách thành viên nhóm
        List<GroupMember> allMembers = iGroupMemberService.getMembersByGroupId(contract.getGroup().getGroupId());
        if (allMembers == null || allMembers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không có thành viên trong nhóm.");
        }

        // ✅ Xác định chủ sở hữu chính (tỷ lệ cao nhất)
        GroupMember ownerMember = allMembers.stream()
                .max(Comparator.comparing(GroupMember::getOwnershipPercentage))
                .orElse(null);
        if (ownerMember == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy chủ sở hữu chính.");
        }

        // ✅ Các đồng sở hữu khác
        List<GroupMember> coOwnerMembers = allMembers.stream()
                .filter(m -> !m.getUsers().getId().equals(ownerMember.getUsers().getId()))
                .toList();

        // ✅ Chuẩn bị dữ liệu Thymeleaf
        Context context = new Context();

        // --- Bên A: Chủ sở hữu chính ---
        Map<String, Object> ownerMap = new HashMap<>();
        ownerMap.put("name", ownerMember.getUsers().getHovaTen());
        ownerMap.put("email", ownerMember.getUsers().getEmail());
        ownerMap.put("idNumber", ownerMember.getUsers().getCccd());
        ownerMap.put("ownership", ownerMember.getOwnershipPercentage());
        context.setVariable("owner", ownerMap);

        // --- Bên A: Các đồng sở hữu ---
        List<Map<String, Object>> coOwnersList = new ArrayList<>();
        for (GroupMember m : coOwnerMembers) {
            Map<String, Object> co = new HashMap<>();
            co.put("name", m.getUsers().getHovaTen());
            co.put("email", m.getUsers().getEmail());
            co.put("idNumber", m.getUsers().getCccd());
            co.put("ownership", m.getOwnershipPercentage());
            coOwnersList.add(co);
        }
        context.setVariable("coOwners", coOwnersList);

        // --- Bên B: Thông tin xe ---
        Map<String, Object> vehicleMap = new HashMap<>();
        vehicleMap.put("brand", vehicle.getBrand());
        vehicleMap.put("model", vehicle.getModel());
        vehicleMap.put("plateNo", vehicle.getPlateNo());
        vehicleMap.put("color", vehicle.getColor());
        vehicleMap.put("batteryCapacity", vehicle.getBatteryCapacity());
        context.setVariable("vehicle", vehicleMap);

        // --- Trạng thái hợp đồng ---
        int statusValue = switch (contract.getStatus().toLowerCase()) {
            case "activated", "signed" -> 1;
            case "declined" -> 0;
            default -> -1;
        };
        context.setVariable("status", statusValue);

        // --- Thông tin hợp đồng chung ---
        context.setVariable("contractCode", contract.getContractId());
        context.setVariable("contractDate", contract.getStartDate());
        context.setVariable("groupName", contract.getGroup().getGroupName());

        // ✅ Render HTML qua Thymeleaf (chưa có chữ ký)
        String html = templateEngine.process("contract-preview", context);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }




}
