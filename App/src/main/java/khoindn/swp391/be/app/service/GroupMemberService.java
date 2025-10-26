package khoindn.swp391.be.app.service;

import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.RequestGroupNotFoundException;
import khoindn.swp391.be.app.model.Request.DecisionVoteReq;
import khoindn.swp391.be.app.model.Request.LeaveGroupReq;
import khoindn.swp391.be.app.model.Response.AllGroupsOfMember;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import khoindn.swp391.be.app.pojo._enum.StatusGroupMember;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupMemberService implements IGroupMemberService {

    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

    // ---------------------- NEW REPO INJECTION ----------------------
    @Autowired
    private IGroupRepository iGroupRepository;

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private ModelMapper modelMapper;
    private IRequestGroupRepository iRequestGroupRepository;
    @Autowired
    private IDecisionVoteRepository iDecisionVoteRepository;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IDecisionVoteDetailRepository iDecisionVoteDetailRepository;

    // ---------------------- EXISTING CODE ----------------------
    @Override
    public List<GroupMember> findAllByUsersId(int userId) {
        return iGroupMemberRepository.findAllByUsersId(userId);
    }

    @Override
    public List<Integer> getGroupIdsByUserId(int userId) {
        List<GroupMember> groupMembers = iGroupMemberRepository.findAllByUsersId(userId);
        return groupMembers.stream()
                .map(gm -> gm.getGroup().getGroupId())
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupMember> getMembersByGroupId(int groupId) {
        return iGroupMemberRepository.findAllByGroup_GroupId(groupId);
    }

    @Override
    public List<AllGroupsOfMember> getAllGroupsOfMember(Users user) {
        List<GroupMember> gm = iGroupMemberRepository.findAllByUsersId(user.getId());


        List<AllGroupsOfMember> res = new ArrayList<>();
        for (GroupMember each : gm) {
            AllGroupsOfMember agm = modelMapper.map(each, AllGroupsOfMember.class);
            agm.setMembers(iGroupMemberRepository.findAllByGroup_GroupId(each.getGroup().getGroupId())
                    .stream()
                    .filter(groupMember ->
                            !user.getId().equals(groupMember.getUsers().getId()))
                    .toList());
            res.add(agm);
        }
        return res;
    }

    @Override
    public GroupMember getGroupOwnerByGroupIdAndUserId(int groupId, int userId) {
        return iGroupMemberRepository.findGroupMembersByUsers_IdAndGroup_GroupId(userId, groupId);
    }

    // ---------------------- NEW CODE: Add member to group ----------------------
    @Override
    @Transactional
    public GroupMember addMemberToGroup(int groupId, int userId, String roleInGroup, Float ownershipPercentage) {
        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("GROUP_NOT_FOUND"));

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        // Check duplicate
        iGroupMemberRepository.findByGroupAndUsers(group, user).ifPresent(gm -> {
            throw new IllegalStateException("ALREADY_IN_GROUP");
        });
        double addPct = ownershipPercentage == null ? 0.0 : ownershipPercentage.doubleValue();

// Khóa để tránh 2 request đồng thời vượt 100%
        iGroupMemberRepository.lockAllByGroupId(groupId);

// Lấy tổng hiện tại
        float currentTotal = iGroupMemberRepository.sumOwnershipByGroupId(groupId);

// Epsilon để tránh sai số số thực
        final float EPS = 0.0001f;
        if (currentTotal + addPct > 100.0f + EPS) {
            throw new IllegalStateException("OWNERSHIP_TOTAL_EXCEEDS_100");
        }
        GroupMember gm = new GroupMember();
        gm.setGroup(group);
        gm.setUsers(user);
        gm.setRoleInGroup((roleInGroup == null || roleInGroup.isBlank()) ? "MEMBER" : roleInGroup.trim());
        gm.setCreatedAt(LocalDateTime.now());
        gm.setOwnershipPercentage(ownershipPercentage == null ? 0f : ownershipPercentage);

        return iGroupMemberRepository.save(gm);
    }

    @Override
    public GroupMember leaveGroup(LeaveGroupReq request) {
        RequestGroup requestProcessing = iRequestGroupRepository.findRequestGroupById(request.getRequestId());
        if (requestProcessing == null) {
            throw new RequestGroupNotFoundException("REQUEST_NOT_FOUND");
        }
        // Update status of GroupMember
        GroupMember user_leaving = requestProcessing.getGroupMember();
        user_leaving.setStatus(StatusGroupMember.LEAVED);
        iGroupMemberRepository.save(user_leaving);
        // Update status of Group
        Group group = user_leaving.getGroup();
        group.setStatus(StatusGroup.INACTIVE);
        iGroupRepository.save(group);
        return user_leaving;
    }

    @Override
    public DecisionVote createDecision(DecisionVoteReq request, GroupMember gm) {
        DecisionVote createdDecisionVote = modelMapper.map(request, DecisionVote.class);
        iDecisionVoteRepository.save(createdDecisionVote);
        Users user = authenticationService.getCurrentAccount();
        List<GroupMember> members = iGroupMemberRepository.findAllByGroup_GroupId(gm.getGroup().getGroupId())
                .stream()
                .filter(groupMember -> !groupMember.getUsers().getId().equals(user.getId()))
                .toList();
        for (GroupMember each : members) {
            DecisionVoteDetail voteDetail = new DecisionVoteDetail();
            voteDetail.setGroupMember(each);
            voteDetail.setDecisionVote(createdDecisionVote);
            iDecisionVoteDetailRepository.save(voteDetail);
        }

        return createdDecisionVote;
    }


}
