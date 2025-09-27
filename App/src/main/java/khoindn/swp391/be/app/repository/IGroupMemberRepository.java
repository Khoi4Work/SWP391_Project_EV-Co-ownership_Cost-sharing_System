package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IGroupMemberRepository extends JpaRepository<GroupMember, Integer> {
}
