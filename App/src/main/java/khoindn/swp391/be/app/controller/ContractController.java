package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.model.Request.ContractReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.service.IContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contract")
@SecurityRequirement(name = "api")

public class ContractController {

    @Autowired
    private IContractService iContractService;

    // Lấy contract
    @GetMapping("/{id}")
    public ResponseEntity<String> getContract(@PathVariable int id) {
        String url = iContractService.getContract(id).getDocumentUrl();
        if (url == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contract not found");
        }
        return ResponseEntity.status(HttpStatus.OK).body(url);
    }

    // Tạo/Set contract
    @PostMapping("/")
    public ResponseEntity<ContractSigner> setContract(@RequestBody ContractReq req) {
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
            iContractService.SendEmail(emailReq);
            return ResponseEntity.status(HttpStatus.OK).body("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }
}
