package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.RequestGroupNotFoundException;
import khoindn.swp391.be.app.model.Request.LeaveGroupReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.RequestGroupService;
import khoindn.swp391.be.app.pojo._enum.StatusContract;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import khoindn.swp391.be.app.pojo._enum.StatusGroupMember;
import khoindn.swp391.be.app.repository.IContractRepository;
import khoindn.swp391.be.app.repository.IGroupMemberRepository;
import khoindn.swp391.be.app.repository.IGroupRepository;
import khoindn.swp391.be.app.repository.IRequestGroupServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StaffService implements IStaffService{

    @Autowired
    IRequestGroupServiceRepository iRequestGroupServiceRepository;
    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;
    @Autowired
    private IGroupRepository iGroupRepository;
    @Autowired
    private IContractService iContractService;
    @Autowired
    private IContractRepository iContractRepository;

    @Override
    public GroupMember leaveGroup(LeaveGroupReq request) {
        RequestGroupService requestProcessing = iRequestGroupServiceRepository.findById(request.getRequestId()).orElse(null);
        System.out.println(requestProcessing);
        if (requestProcessing == null) {
            throw new RequestGroupNotFoundException("REQUEST_NOT_FOUND");
        }

        // Update status of GroupMember
        GroupMember user_leaving = requestProcessing.getGroupMember();
        user_leaving.setStatus(StatusGroupMember.LEFT);
        iGroupMemberRepository.save(user_leaving);

        List<GroupMember> members = iGroupMemberRepository.findAllByGroupAndStatus(user_leaving.getGroup(), StatusGroupMember.ACTIVE);
        for (GroupMember member : members) {
            member.setStatus(StatusGroupMember.INACTIVE);
            iGroupMemberRepository.save(member);
        }

        // Update status of Group
        Group group = user_leaving.getGroup();
        group.setStatus(StatusGroup.INACTIVE);
        iGroupRepository.save(group);

        Contract contract = iContractRepository.findContractByGroup_GroupId(group.getGroupId());
        contract.setEndDate(LocalDate.now());
        contract.setStatus(StatusContract.TERMINATED);
        iContractRepository.save(contract);
        return user_leaving;
    }
}
