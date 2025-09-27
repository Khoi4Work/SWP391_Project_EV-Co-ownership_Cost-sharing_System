package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.pojo.Vehicle;
import khoindn.swp391.be.app.repository.IGroupMemberRepository;
import khoindn.swp391.be.app.repository.IGroupRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
import khoindn.swp391.be.app.repository.IVehicleRepository;
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
    private ModelMapper modelMapper;

    @Override
    public RegisterVehicleRes addMemberToGroup(RegisterVehicleReq request) {
        // 1. Lấy vehicle
        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(request.getVehicleId());
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + request.getVehicleId());
        }

        // 2. Check vehicle đã có group chưa
        if (vehicle.getGroup_id() != null) {
            throw new RuntimeException("Vehicle already belongs to a group");
        }

        // 3. Tạo group mới
        Group group = new Group();
        group.setGroupName("Group-" + new Random().nextInt(10000));
        group.setDescription("This group was created when registering vehicle " + vehicle.getPlateNo());
        group.setCreatedAt(LocalDateTime.now());
        group = iGroupRepository.save(group);

        // 4. Gán group vào vehicle
        vehicle.setGroup_id(group);
        iVehicleRepository.save(vehicle);

        // 5. Tạo group members từ emails
        List<UsersResponse> owners = new ArrayList<>();
        for (String email : request.getEmail()) {
            Users user = iUserRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }

            GroupMember gm = new GroupMember();
            gm.setGroup(group);
            gm.setUsers(user);
            gm.setRoleInGroup("Member");
            gm.setOwnershipPercentage(request.getOwnership_percentage());
            gm.setCreatedAt(LocalDateTime.now());
            iGroupMemberRepository.save(gm);

            owners.add(modelMapper.map(user, UsersResponse.class));
        }

        // 6. Build response
        RegisterVehicleRes res = new RegisterVehicleRes();
        // map vehicle fields
        modelMapper.map(vehicle, res);
        // map group fields
        res.setGroupId(group);
        // map owners
        res.setOwners(owners);

        return res;
    }
}
