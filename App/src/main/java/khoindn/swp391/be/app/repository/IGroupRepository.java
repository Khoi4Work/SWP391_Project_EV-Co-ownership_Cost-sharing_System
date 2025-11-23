package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IGroupRepository extends JpaRepository<Group, Integer> {
    Group findGroupByGroupId(int groupId);

    Group findByGroupIdAndStatus(int groupId, StatusGroup status);
}
