package khoindn.swp391.be.app.service;

import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.model.Response.AllGroupsOfMember;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IGroupMemberRepository;
import khoindn.swp391.be.app.repository.IGroupRepository;
import khoindn.swp391.be.app.repository.IUserRepository;
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
    private IGroupRepository groupRepository;

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private ModelMapper modelMapper;

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
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("GROUP_NOT_FOUND"));

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        // Check duplicate
        iGroupMemberRepository.findByGroupAndUsers(group, user).ifPresent(gm -> {
            throw new IllegalStateException("ALREADY_IN_GROUP");
        });

        GroupMember gm = new GroupMember();
        gm.setGroup(group);
        gm.setUsers(user);
        gm.setRoleInGroup((roleInGroup == null || roleInGroup.isBlank()) ? "MEMBER" : roleInGroup.trim());
        gm.setStatus("ACTIVE");
        gm.setCreatedAt(LocalDateTime.now());
        gm.setOwnershipPercentage(ownershipPercentage == null ? 0f : ownershipPercentage);

        return iGroupMemberRepository.save(gm);
    }
}
