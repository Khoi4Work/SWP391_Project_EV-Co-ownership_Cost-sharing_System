package khoindn.swp391.be.app.service;

import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.ContractNotExistedException;
import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.model.Response.ContractPendingRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.StatusContract;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

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
    private IGroupMemberRepository iGroupMemberRepository;
    @Autowired
    private IVehicleRepository iVehicleRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private SpringTemplateEngine templateEngine;


    @Override
    public Contract getContractByContractId(int id) {
        Contract contract = iContractRepository.findContractByContractId(id);

        if (contract == null) throw new ContractNotExistedException("Contract cannot found!");
        return contract;
    }


    @Override
    public ContractSigner setContract(ContractDecisionReq req)
            throws
            InvalidKeySpecException,
            NoSuchAlgorithmException,
            SignatureException,
            InvalidKeyException {

        System.out.println("Update contract...");

        Users user = iUserRepository.findUsersById(req.getIdUser());
        System.out.println(user);

        //Parse privateKey va publicKey sang byte

        byte[] privateKeyReceived;
        byte[] publicKeyUser;
        try {
            privateKeyReceived = Base64.getDecoder().decode(req.getContract_signature());
            publicKeyUser = Base64.getDecoder().decode(user.getPublicKey());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 encoding for keys");
        }


        if (iContractSignerRepository.existsByUser_Id(user.getId())) {
            ContractSigner contractSigner = iContractSignerRepository
                    .findByUser_IdAndContract_ContractId(user.getId(), req.getIdContract());
            // Cập nhật decision
            if (req.getIdChoice() == 1) {

                contractSigner.setDecision("Signed");

                // Kiểm tra privateKey và publicKey có khớp không

                KeyFactory keyFactory = KeyFactory.getInstance("RSA");

                PrivateKey privateKey = keyFactory.generatePrivate(
                        new PKCS8EncodedKeySpec(privateKeyReceived));
                PublicKey publicKey = keyFactory.generatePublic(
                        new X509EncodedKeySpec(publicKeyUser));

                // Nếu không có exception thì khóa hợp lệ
                byte[] contractBytes = req.getContractContent().getBytes();
                // ký
                Signature signature = Signature.getInstance("SHA256withRSA");
                signature.initSign(privateKey);
                signature.update(contractBytes);
                byte[] signatureBytes = signature.sign();
                // verify
                Signature verifier = Signature.getInstance("SHA256withRSA");
                verifier.initVerify(publicKey);
                verifier.update(contractBytes);
                boolean isVerified = verifier.verify(signatureBytes);
                if (!isVerified) {
                    throw new IllegalArgumentException("Private key does not match public key");
                }
                System.out.println("✅ Private key matches public key.");

                // Lưu chữ ký dưới dạng Base64
                contractSigner.setSignature(Base64.getEncoder().encodeToString(signatureBytes));


                contractSigner.setSignedAt(LocalDateTime.now());

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
                contract.setStatus(StatusContract.DECLINED);
                contract.setEndDate(LocalDate.now());
            } else if (allSigned) {
                contract.setStatus(StatusContract.CONFIRMED);
            } else if (stillPending) {
                contract.setStatus(StatusContract.WAITING_CONFIRMATION);
            }
            contract.setHtmlString(req.getContractContent());
            iContractRepository.save(contract);


            return contractSigner;
        } else {
            throw new IllegalArgumentException("Invalid userId value");
        }
    }


    @Override
    public List<ContractSigner> createContract(ContractCreateReq req) {

        List<ContractSigner> signerList = new ArrayList<>();

        Contract contract = new Contract();

        contract.setContractType(req.getContractType());
        contract.setStartDate(LocalDate.now());
        contract.setUrlContract(req.getDocumentUrl());
        if (contract.getContractType().contains("paper")) {
            contract.setStatus(StatusContract.WAITING_CONFIRMATION);
        }
        iContractRepository.save(contract);

        Vehicle vehicle = modelMapper.map(req, Vehicle.class);
        iVehicleRepository.save(vehicle);

        for (Integer userId : req.getUserId()) {
            Users users = iUserRepository.findUsersById(userId);
            ContractSigner contractSigner = new ContractSigner();

            // Tao nguoi ky contract

            contractSigner.setContract(contract);
            contractSigner.setUser(users);
            contractSigner.setDecision("Pending");
            iContractSignerRepository.save(contractSigner);

            signerList.add(contractSigner);

            // Tao request vehicle

        }
        return signerList;
    }


    @Override
    public List<ContractHistoryRes> getHistoryContractsByUser(Users user) {
        List<ContractHistoryRes> historyRes = new ArrayList<>();
        List<GroupMember> userGroup = iGroupMemberRepository.findAllByUsersId(user.getId());
        for (GroupMember groupMember : userGroup) {

            ContractHistoryRes contractHistoryRes = new ContractHistoryRes();


            Contract contract = iContractRepository.findContractByGroup_GroupId(groupMember.getGroup().getGroupId());
            if (contract == null) {
                throw new IllegalArgumentException("Invalid userId value");
            }
            Vehicle vehicle = iVehicleRepository.findVehicleByGroup(groupMember.getGroup());
            if (vehicle == null) {
                throw new IllegalArgumentException("Invalid Group value");
            }


            contractHistoryRes.setStatus(contract.getStatus().toString());
            contractHistoryRes.setSignedAt(contract.getStartDate());
            contractHistoryRes.setVehicleName(vehicle.getBrand() + " " + vehicle.getModel());
            contractHistoryRes.setContractId(contract.getContractId());


            contractHistoryRes.setOwnership(groupMember.getOwnershipPercentage());

            historyRes.add(contractHistoryRes);
        }
        System.out.println(historyRes);

        return historyRes;
    }

    @Override
    public List<ContractSigner> getAllContractSignersByContractId(int id) {
        List<ContractSigner> signerList = iContractSignerRepository.findAllByContract_ContractId(id);
        if (signerList.isEmpty()) {
            throw new IllegalArgumentException("No signers found for the given contract ID");
        }
        return signerList;
    }

    @Override
    public List<ContractSigner> getContractSignerByContractId(int id) {
        return iContractSignerRepository.findAllByContract_ContractId(id);
    }

    @Override
    public List<ContractPendingRes> getPendingContracts() {
        List<ContractPendingRes> contractPendingRes = new ArrayList<>();
        List<Contract> pendingContracts = iContractRepository.getContractsByStatus(StatusContract.PENDING_REVIEW);
        for (Contract contract : pendingContracts) {
            List<ContractSigner> signerList = iContractSignerRepository.findAllByContract_ContractId(contract.getContractId());
            ContractPendingRes pendingRes = new ContractPendingRes();
            pendingRes.setContract(contract);
            pendingRes.setContractSignerList(signerList.stream().map(ContractSigner::getUser).toList());
            contractPendingRes.add(pendingRes);
        }
        return contractPendingRes;
    }

    @Override
    public void SendWaitingConfirmedContract(int contractId) {
        List<ContractSigner> signerList = getContractSignerByContractId(contractId);

        Contract contract = getContractByContractId(contractId);

        if (contract.getStatus().equals(StatusContract.WAITING_CONFIRMATION)) {
            for (ContractSigner signer : signerList) {
                // ✅ TẠO TOKEN RIÊNG CHO USER
                String token = tokenService.generateToken(signer.getUser());
                String secureUrl = contract.getUrlContract() + contract.getContractId() + "?token=" + token;
                try {
                    MimeMessage message = javaMailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true);

                    Context context = new Context();
                    context.setVariable("secureUrl", secureUrl);

                    String content = templateEngine.process("contract", context);

                    helper.setTo(signer.getUser().getEmail());
                    helper.setSubject("[EcoShare System] Send E-Contract to User");
                    helper.setText(content, true);
                    javaMailSender.send(message);
                } catch (Exception e) {
                    e.getMessage();
                }
            }
        }
    }


}
