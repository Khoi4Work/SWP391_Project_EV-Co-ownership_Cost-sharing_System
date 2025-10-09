package khoindn.swp391.be.app.service;

import jakarta.mail.internet.MimeMessage;
import khoindn.swp391.be.app.exception.exceptions.ContractNotExistedException;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IContractRepository;
import khoindn.swp391.be.app.repository.IContractSignerRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ContractService implements IContractService {
    @Autowired
    private IContractRepository iContractRepository;
    @Autowired
    private IContractSignerRepository iContractSignerRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private IUserRepository iUserRepository;


    @Override
    public Contract getContract(int id) {
        Contract contract = iContractRepository.findContractByContractId(id);

        if(contract==null) throw new ContractNotExistedException("Contract cannot found!");
        return contract;
    }


    @Override
    public ContractSigner setContract(ContractDecisionReq req) {
        if (iContractSignerRepository.existsByUser_Id(req.getIdUserSigned())) {
            ContractSigner contractSigner = iContractSignerRepository
                    .findByUser_IdAndContract_ContractId(req.getIdUserSigned(),req.getIdContract());
            // Cập nhật decision
            if (req.getIdChoice() == 1) {
                contractSigner.setDecision("Signed");
            } else if (req.getIdChoice() == 0) {
                contractSigner.setDecision("Declined");
            } else {
                throw new IllegalArgumentException("Invalid choice value");
            }
            iContractSignerRepository.save(contractSigner);

            // Kiểm tra trạng thái toàn bộ contractSigner
            List<ContractSigner> allSigners =
                    iContractSignerRepository.findByContract_ContractId(req.getIdContract());

            boolean anyDeclined = allSigners.stream().anyMatch(
                    s -> "Declined".equalsIgnoreCase(s.getDecision()));
            boolean allSigned = allSigners.stream().allMatch(
                    s -> "Signed".equalsIgnoreCase(s.getDecision()));
            boolean stillPending = allSigners.stream().anyMatch(
                    s -> "Pending".equalsIgnoreCase(s.getDecision()));

            Contract contract = contractSigner.getContract();

            if (anyDeclined) {
                contract.setStatus("Declined");
            } else if (allSigned) {
                contract.setStatus("Activated");
            } else if (stillPending) {
                contract.setStatus("Pending");
            }

            iContractRepository.save(contract);


            return contractSigner;
        }else  {
            throw new IllegalArgumentException("Invalid userId value");
        }
    }

//    @Override
//    public void SendEmail(SendEmailReq emailReq) {
//        for (String eachEmail : emailReq.getEmail()) {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(eachEmail);
//            message.setSubject("[EcoShare System] E-Contract");
//            message.setText("Link Contract"+emailReq.getDocumentUrl());
//
//            javaMailSender.send(message);
//        }
//
//    }

    @Override
    public void SendBulkEmail(SendEmailReq emailReq) {
        for (String eachEmail : emailReq.getEmail()) {
            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setTo(eachEmail);
                helper.setSubject("[EcoShare System] E-Contract");
                helper.setText(
                        "<a href='" + emailReq.getDocumentUrl() +
                                "'>Nhấn vào đây để xem hợp đồng</a>", true);

                javaMailSender.send(message);
            } catch (Exception e) {
                e.getMessage();
            }
        }
    }

    @Override
    public ContractSigner createContract(ContractCreateReq req) {
        Contract contract = new Contract();
        ContractSigner contractSigner = new ContractSigner();
        for (Integer userId : req.getUserId()){
            Users users = iUserRepository.findUsersById(userId);
            // Tao Contract

            contract.setContractType(req.getContractType());
            contract.setStartDate(LocalDate.now());
            contract.setDocumentUrl(req.getDocumentUrl());
            contract.setStatus("Pending");
            iContractRepository.save(contract);
            // Tao nguoi ky contract

            contractSigner.setContract(contract);
            contractSigner.setUser(users);
            contractSigner.setDecision("Pending");
            iContractSignerRepository.save(contractSigner);

            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setTo(users.getEmail());
                helper.setSubject("[EcoShare System] E-Contract");
                helper.setText(
                        "<a href='" + req.getDocumentUrl() +
                                "'>Nhấn vào đây để xem hợp đồng</a>", true);

                javaMailSender.send(message);
            } catch (Exception e) {
                e.getMessage();
            }
        }
        return contractSigner;

    }


}
