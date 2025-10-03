package khoindn.swp391.be.app.controller;

import khoindn.swp391.be.app.model.Request.ContractReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.service.IContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contract")
public class ContractController {

    @Autowired
    private IContractService iContractService;

    @GetMapping("/")
    public ResponseEntity<String> getContract(int id){
        return ResponseEntity.ok(iContractService.getContract(id).getDocumentUrl());
    }

    @PostMapping("/{id}")
    public ResponseEntity<ContractSigner> setContract(@RequestBody ContractReq req){
        ContractSigner contractResult = iContractService.setContract(req);
        return ResponseEntity.ok(contractResult);
    }

    @PostMapping("/")
    public void SendEmail(@RequestBody SendEmailReq emailReq){
        iContractService.SendEmail(emailReq);
    }

}
