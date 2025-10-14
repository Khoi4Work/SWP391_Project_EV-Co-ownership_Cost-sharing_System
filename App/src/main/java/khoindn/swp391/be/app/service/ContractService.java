package khoindn.swp391.be.app.service;

import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.ContractNotExistedException;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.repository.*;
import org.apache.catalina.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ContractService implements IContractService {
    @Autowired
    private IContractRepository iContractRepository;
    @Autowired
    private IContractSignerRepository iContractSignerRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private IUserRepository iUserRepository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;
    @Autowired
    private IVehicleRepository iVehicleRepository;
    @Autowired
    private ModelMapper modelMapper;


    @Override
    public Contract getContractByContractId(int id) {
        Contract contract = iContractRepository.findContractByContractId(id);

        if (contract == null) throw new ContractNotExistedException("Contract cannot found!");
        return contract;
    }


    @Override
    public ContractSigner setContract(ContractDecisionReq req) {
        System.out.println("Update contract...");
        Users user = iUserRepository.findUsersById(req.getIdUser());
        System.out.println(user);
        if (iContractSignerRepository.existsByUser_Id(user.getId())) {
            ContractSigner contractSigner = iContractSignerRepository
                    .findByUser_IdAndContract_ContractId(user.getId(), req.getIdContract());
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
                contract.setEndDate(LocalDate.now());
            } else if (allSigned) {
                contract.setStatus("Activated");
            } else if (stillPending) {
                contract.setStatus("Pending");
            }

            iContractRepository.save(contract);


            return contractSigner;
        } else {
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
                        "<a href='" + emailReq.getContent() +
                                "'>Nhấn vào đây để xem hợp đồng</a>", true);

                javaMailSender.send(message);
            } catch (Exception e) {
                e.getMessage();
            }
        }
    }

    @Override
    public List<ContractSigner> createContract(ContractCreateReq req) {

        List<ContractSigner> signerList = new ArrayList<>();

        Contract contract = new Contract();

        contract.setContractType(req.getContractType());
        contract.setStartDate(LocalDate.now());
        contract.setDocumentUrl(req.getDocumentUrl());
        contract.setStatus("Pending");
        iContractRepository.save(contract);


        for (Integer userId : req.getUserId()) {
            Users users = iUserRepository.findUsersById(userId);
            ContractSigner contractSigner = new ContractSigner();
            // Tao Contract


            // Tao nguoi ky contract

            contractSigner.setContract(contract);
            contractSigner.setUser(users);
            contractSigner.setDecision("Pending");
            iContractSignerRepository.save(contractSigner);

            signerList.add(contractSigner);

            // ✅ TẠO TOKEN RIÊNG CHO USER
            String token = tokenService.generateToken(users);
            String secureUrl = req.getDocumentUrl() + contract.getContractId() + "?token=" + token;

            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setTo(users.getEmail());
                helper.setSubject("[EcoShare System] Send E-Contract to User");
                helper.setText("Kính mời Quý khách truy cập vào " +
                        "<a href='" + secureUrl + "'>liên kết này</a>" +
                        " để xem thông tin chi tiết về hợp đồng đồng sở hữu.", true);
                javaMailSender.send(message);
            } catch (Exception e) {
                e.getMessage();
            }
        }
        return signerList;

    }

    @Override
    public ContractHistoryRes getHistoryContractsByUser(Users user) {
        //get all info
        Contract contract = iContractSignerRepository.findContractSignerByUser(user).getContract();
        GroupMember member = iGroupMemberRepository.findGroupMembersByUsers(user);
        Vehicle vehicle = iVehicleRepository.findVehicleByGroup(member.getGroup());
        ContractHistoryRes res = modelMapper.map(contract, ContractHistoryRes.class);
        modelMapper.map(vehicle, res);
        modelMapper.map(member, res);
        System.out.println("SendBack: " + res);
        return res;
    }

    @Override
    public List<ContractSigner> getContractSignerByContractId(int id) {
        return iContractSignerRepository.findAllByContract_ContractId(id);
    }



}
