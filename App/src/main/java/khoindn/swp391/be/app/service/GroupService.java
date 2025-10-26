package khoindn.swp391.be.app.service;

import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.*;
import khoindn.swp391.be.app.model.Request.GroupCreateReq;
import khoindn.swp391.be.app.model.Request.GroupRequest;
import khoindn.swp391.be.app.model.Request.UpdateRequestGroup;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.formatReq.CoOwner_Info;
import khoindn.swp391.be.app.model.formatReq.ResponseVehicleRegisteration;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import khoindn.swp391.be.app.pojo._enum.StatusGroupMember;
import khoindn.swp391.be.app.pojo._enum.StatusRequestGroup;
import khoindn.swp391.be.app.pojo._enum.StatusRequestGroupDetail;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Transactional
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
    private ICommonFundRepository commonFundRepository;

    @Autowired
    private IContractSignerRepository iContractSignerRepository;

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IRequestGroupRepository iRequestGroupRepository;
    @Autowired
    private IRequestGroupDetailRepository iRequestGroupDetailRepository;


    @Override
    public RegisterVehicleRes addMemberToGroupByContract(GroupCreateReq request) {
        System.out.println(request);


        // 3. Tạo group mới
        Group group = new Group();
        group.setGroupName("Group-" + new Random().nextInt(10000));
        group.setDescription("This group was created when registering vehicle ");
        group.setCreatedAt(LocalDateTime.now());
        iGroupRepository.save(group);
        // tu dong tao common fund cho group
        CommonFund commonFund = new CommonFund();
        commonFund.setGroup(group);
        commonFund.setBalance(BigDecimal.ZERO);
        commonFundRepository.save(commonFund);

        Contract contract = iContractRepository.findContractByContractId(request.getContractId());
        contract.setGroup(group);
        iContractRepository.save(contract);
        // Tim vehicle
        Vehicle vehicle = iVehicleRepository.getVehiclesByVehicleId(request.getVehicleId());
        if (vehicle == null) {
            throw new VehicleIsNotExistedException("This Vehicle does not exist");
        } else if (vehicle.getGroup() != null) {
            throw new VehicleIsRegisteredException(
                    "This " + vehicle.getGroup().getGroupName() + " is already registered this vehicle");
        } else {
            vehicle.setGroup(group);
            iVehicleRepository.save(vehicle);
        }


        // 7. Tạo group members từ emails
        List<ResponseVehicleRegisteration> owners = new ArrayList<>();

        for (CoOwner_Info member : request.getMembers()) {
            Users user = iUserRepository.findUsersById(member.getCoOwnerId());
            if (user == null) {
                throw new RuntimeException("User not found !!");
            }

            GroupMember gm = new GroupMember();
            gm.setGroup(group);
            gm.setUsers(user);
            gm.setRoleInGroup(member.getRoleInGroup());//?
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

        System.out.println(res);
        return res;
    }

    @Override
    public void deleteGroup(int groupId) {
        Group group = iGroupRepository.findGroupByGroupId(groupId);
        if (group != null) {
            Vehicle vehicle = iVehicleRepository.findVehicleByGroup(group);
            if (vehicle != null) {
                List<GroupMember> members = iGroupMemberRepository.findAllByGroup_GroupId(groupId);
                if (members != null) {
                    members.forEach(member -> {
                        member.setStatus(StatusGroupMember.DELETED);
                        iGroupMemberRepository.save(member);
                    });
                    vehicle.setGroup(null);
                    iVehicleRepository.save(vehicle);
                    group.setStatus(StatusGroup.DELETED);
                    iGroupRepository.save(group);
                } else {
                    throw new GroupMemberNotFoundException("No members found in the group");
                }
            } else {
                throw new VehicleIsNotRegisteredException("No vehicle is registered in this group");
            }
        } else {
            throw new GroupNotFoundException("Group not found");
        }
    }

    @Override
    public void createRequestGroup(GroupRequest request, Users user) {
        // Tim group nao gui request va kiem tra ton tai
        Group group = iGroupRepository.findGroupByGroupId(request.getGroupId());
        if (group == null) {
            throw new GroupNotFoundException("Group not found");
        }
        // Lay member nao trong group tao request
        GroupMember member = iGroupMemberRepository.findByGroupAndUsers(group, user).orElse(null);
        // tao request
        RequestGroup requestGroup = new RequestGroup();
        requestGroup.setGroupMember(member);
        requestGroup.setNameRequestGroup(request.getNameRequestGroup());
        if (!request.getDescriptionRequestGroup().isEmpty()) {
            requestGroup.setDescriptionRequestGroup(request.getDescriptionRequestGroup());
        }

        // tao group detail
        RequestGroupDetail detail = new RequestGroupDetail();
        detail.setRequestGroup(requestGroup);

        // luu vao db
        iRequestGroupRepository.save(requestGroup);
        iRequestGroupDetailRepository.save(detail);
    }

    @Override
    public void updateRequestGroup(UpdateRequestGroup update, Users staff) {
        RequestGroup req = iRequestGroupRepository.findRequestGroupById(update.getIdRequestGroup());
        if (req == null) {
            throw new RequestGroupNotFoundException("RequestGroup not found");
        }

        if (update.getIdChoice() == 1) {
            req.setStatus(StatusRequestGroup.SOLVED);
            req.getRequestGroupDetail().setStaff(staff);
            req.getRequestGroupDetail().setStatus(StatusRequestGroupDetail.APPROVED);
            req.getRequestGroupDetail().setSolvedAt(LocalDateTime.now());
            iRequestGroupRepository.save(req);
        } else if (update.getIdChoice() == 0) {
            req.setStatus(StatusRequestGroup.DENIED);
            req.getRequestGroupDetail().setStaff(staff);
            req.getRequestGroupDetail().setStatus(StatusRequestGroupDetail.REJECTED);
            req.getRequestGroupDetail().setSolvedAt(LocalDateTime.now());
            iRequestGroupRepository.save(req);
        } else if (update.getIdChoice() == 2) {
            req.setStatus(StatusRequestGroup.PROCESSING);
            req.getRequestGroupDetail().setStaff(staff);
            req.getRequestGroupDetail().setStatus(StatusRequestGroupDetail.PROCESSING);
            req.getRequestGroupDetail().setSolvedAt(LocalDateTime.now());
            iRequestGroupRepository.save(req);
        } else {
            throw new UndefinedChoiceException("Undefined Choice");

        }
    }

    @Override
    public Group getGroupById(int groupId) {
        Group group = iGroupRepository.findGroupByGroupId(groupId);
        if (group == null) {
            throw new GroupNotFoundException("Group not found");
        }
        return group;
    }


}
