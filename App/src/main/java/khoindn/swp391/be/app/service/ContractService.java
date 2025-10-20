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

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
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
                try {
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

                } catch (NoSuchAlgorithmException e) {
                    throw new RuntimeException(e);
                } catch (InvalidKeySpecException e) {
                    throw new RuntimeException(e);
                } catch (SignatureException e) {
                    throw new RuntimeException(e);
                } catch (InvalidKeyException e) {
                    throw new RuntimeException(e);
                }

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



    @Override
    public List<ContractSigner> createContract(ContractCreateReq req) {

        List<ContractSigner> signerList = new ArrayList<>();

        Contract contract = new Contract();

        contract.setContractType(req.getContractType());
        contract.setStartDate(LocalDate.now());
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


            modelMapper.map(contract, contractHistoryRes);
            modelMapper.map(vehicle, contractHistoryRes);
            contractHistoryRes.setOwnership(groupMember.getOwnershipPercentage());

            historyRes.add(contractHistoryRes);
        }

        return historyRes;
    }

    @Override
    public List<ContractSigner> getContractSignerByContractId(int id) {
        return iContractSignerRepository.findAllByContract_ContractId(id);
    }


}
