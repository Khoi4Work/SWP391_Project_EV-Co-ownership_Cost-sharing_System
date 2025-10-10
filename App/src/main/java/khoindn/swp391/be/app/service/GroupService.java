package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.VehicleIsNotExistedException;
import khoindn.swp391.be.app.exception.exceptions.VehicleIsRegisteredException;
import khoindn.swp391.be.app.model.Request.GroupCreateReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.formatReq.CoOwner_Info;
import khoindn.swp391.be.app.model.formatReq.ResponseVehicleRegisteration;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public RegisterVehicleRes addMemberToGroup(GroupCreateReq request) {
        System.out.println(request);


        // 3. Tạo group mới
        Group group = new Group();
        group.setGroupName("Group-" + new Random().nextInt(10000));
        group.setDescription("This group was created when registering vehicle ");
        group.setCreatedAt(LocalDateTime.now());
        iGroupRepository.save(group);

        // Tim vehicle
        Vehicle vehicle = iVehicleRepository.getVehiclesByVehicleId(request.getVehicleId());
        if(vehicle==null){
            throw new VehicleIsNotExistedException("This Vehicle does not exist");
        } else if (vehicle.getGroup() != null) {
            throw  new VehicleIsRegisteredException(
                    "This "+vehicle.getGroup().getGroupName()+" is already registered this vehicle");
        }else {
            vehicle.setGroup(group);
            iVehicleRepository.save(vehicle);
        }


        // 7. Tạo group members từ emails
        List<ResponseVehicleRegisteration> owners = new ArrayList<>();
        for (CoOwner_Info member : request.getMember()) {
            ContractSigner contract = iContractSignerRepository
                    .findContractSignerByContract_ContractId((member.getContractId()));
            Users user = iUserRepository.findUsersById(contract.getUser().getId());
            if (user == null) {
                throw new RuntimeException("User not found with email: " + contract.getUser().getEmail());
            }

            GroupMember gm = new GroupMember();
            gm.setGroup(group);
            gm.setUsers(user);
            gm.setRoleInGroup(request.getRoleInGroup());//?
            gm.setOwnershipPercentage(member.getOwnershipPercentage());
            gm.setCreatedAt(LocalDateTime.now());
            iGroupMemberRepository.save(gm);

            owners.add(modelMapper.map(user, ResponseVehicleRegisteration.class));
        }

        // 8. Build response
        RegisterVehicleRes res = new RegisterVehicleRes();
        // map group fields
        res.setGroup(group);
        // map owners
        res.setOwners(owners);
        // Set up send contract via email
        modelMapper.map(vehicle, res);

        return res;
    }

}
