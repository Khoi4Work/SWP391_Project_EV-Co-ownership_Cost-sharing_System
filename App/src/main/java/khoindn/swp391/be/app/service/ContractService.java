package khoindn.swp391.be.app.service;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import khoindn.swp391.be.app.model.Request.ContractReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IContractRepository;
import khoindn.swp391.be.app.repository.IContractSignerRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractService implements IContractService {
    @Autowired
    private IContractRepository iContractRepository;
    @Autowired
    private IContractSignerRepository iContractSignerRepository;
    @Autowired
    private JavaMailSender javaMailSender;


    @Override
    public Contract getContract(int id) {
        return iContractRepository.findContractByContractId(id);
    }


    @Override
    public ContractSigner setContract(ContractReq req, int idChoice) {
        if (iContractSignerRepository.existsByUser_Id(req.getIdUserSigned())) {
            ContractSigner contractSigner = iContractSignerRepository
                    .findByUser_IdAndContract_ContractId(req.getIdUserSigned(),req.getIdContract());
            if (idChoice == 1) {
                contractSigner.getContract().setStatus("Activated");
                contractSigner.setDecision("Signed");
                iContractSignerRepository.save(contractSigner);
            } else if (idChoice == 0) {
                contractSigner.getContract().setStatus("Deactivated");
                contractSigner.setDecision("Declined");
                iContractSignerRepository.save(contractSigner);
            } else {
                throw new IllegalArgumentException("Invalid choice value");
            }
            return contractSigner;
        }else  {
            throw new IllegalArgumentException("Invalid userId value");
        }
    }

    @Override
    public void SendEmail(SendEmailReq emailReq) {
        for (String eachEmail : emailReq.getEmail()) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(eachEmail);
            message.setSubject("[EcoShare System] E-Contract");
            message.setText(emailReq.getDocumentUrl());

            javaMailSender.send(message);
        }

    }


}
