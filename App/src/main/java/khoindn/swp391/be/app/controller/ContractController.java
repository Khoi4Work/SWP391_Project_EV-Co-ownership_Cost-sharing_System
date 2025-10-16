package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.AuthenticationService;
import khoindn.swp391.be.app.service.IContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contract")
@SecurityRequirement(name = "api")

public class ContractController {

    @Autowired
    private IContractService iContractService;

    @Autowired
    private AuthenticationService authenticationService;

    // Lấy contract
    @GetMapping("/user/{id}")
    public ResponseEntity<Contract> getContractByUserId(@PathVariable int id) {
        Contract contract = iContractService.getContractByUser(id);
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
        Contract contract = iContractService.getContractByUser(user.getId());
        return ResponseEntity.status(HttpStatus.OK).body(contract);
    }
}
