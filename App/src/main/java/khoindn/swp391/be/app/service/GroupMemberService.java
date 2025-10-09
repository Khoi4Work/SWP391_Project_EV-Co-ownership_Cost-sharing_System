package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.repository.IGroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupMemberService implements IGroupMemberService {
    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

    @Override
    public List<GroupMember> findAllByUsersId(int userId) {
        return iGroupMemberRepository.findAllByUsersId(userId);
    }
}
