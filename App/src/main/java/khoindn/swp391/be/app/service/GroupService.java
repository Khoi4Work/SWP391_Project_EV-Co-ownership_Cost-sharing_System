package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.VehicleIsRegisteredException;
import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.model.formatReq.CoOwner_Info;
import khoindn.swp391.be.app.model.formatReq.ResponseVehicleRegisteration;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class GroupService implements IGroupService {

    @Autowired
    private IGroupRepository iGroupRepository;

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private IVehicleRepository iVehicleRepository;

    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

    @Autowired
    private IContractRepository iContractRepository;

    @Autowired
    private IContractSignerRepository iContractSignerRepository;

    @Autowired
    private ModelMapper modelMapper;




    @Override
    public RegisterVehicleRes addMemberToGroup(RegisterVehicleReq request) {
        // 1. Lấy vehicle
        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(request.getVehicleId());
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + request.getVehicleId());
        }

        // 2. Check vehicle đã có group chưa
        if (vehicle.getGroup() != null) {
            throw new VehicleIsRegisteredException(
                    "Vehicle already belongs to a group" + vehicle.getGroup().getGroupName());
        }

        // 3. Tạo group mới
        Group group = new Group();
        group.setGroupName("Group-" + new Random().nextInt(10000));
        group.setDescription("This group was created when registering vehicle " + vehicle.getPlateNo());
        group.setCreatedAt(LocalDateTime.now());
        group = iGroupRepository.save(group);

        // 4. Gán group vào vehicle
        vehicle.setGroup(group);
        iVehicleRepository.save(vehicle);

        // 5. Tạo contract
        Contract contract = new Contract();
        contract.setStartDate(LocalDate.now());
        contract.setStatus("pending");
        contract.setDocumentUrl(request.getDocumentUrl());
        contract.setContractType(request.getContractType());
        contract.setGroup(group);
        iContractRepository.save(contract);



        // 7. Tạo group members từ emails
        List<ResponseVehicleRegisteration> owners = new ArrayList<>();
        for (CoOwner_Info member : request.getMember()) {
            Users user = iUserRepository.findByEmail(member.getEmail());
            if (user == null) {
                throw new RuntimeException("User not found with email: " + member.getEmail());
            }

            GroupMember gm = new GroupMember();
            gm.setGroup(group);
            gm.setUsers(user);
            gm.setRoleInGroup("Member");
            gm.setOwnershipPercentage(member.getOwnershipPercentage());
            gm.setCreatedAt(LocalDateTime.now());
            iGroupMemberRepository.save(gm);

            owners.add(modelMapper.map(user, ResponseVehicleRegisteration.class));
            // 6. Tạo người ký contract
            ContractSigner contractSigner = new ContractSigner();
            contractSigner.setContract(contract);
            contractSigner.setDecision("pending");
            contractSigner.setUser(user);
            iContractSignerRepository.save(contractSigner);
        }

        // 8. Build response
        RegisterVehicleRes res = new RegisterVehicleRes();
        // map vehicle fields
        modelMapper.map(vehicle, res);
        // map group fields
        res.setGroupId(group);
        // map owners
        res.setOwners(owners);
        // Set up send contract via email


        return res;
    }

}
