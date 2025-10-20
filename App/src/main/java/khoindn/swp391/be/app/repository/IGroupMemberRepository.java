package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IGroupMemberRepository extends JpaRepository<GroupMember, Integer> {
    Optional<GroupMember> findByGroupAndUsers(Group group, Users users);
    List<GroupMember> findAllByUsersId(int userId);


    GroupMember findGroupMembersByUsers(Users users);

    List<GroupMember> findAllByGroup_GroupId(int groupGroupId);

    GroupMember findGroupMembersByUsers_IdAndGroup_GroupId(Integer usersId, int groupGroupId);
}
