package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.repository.IGroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupMemberService implements IGroupMemberService {
    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

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
}
