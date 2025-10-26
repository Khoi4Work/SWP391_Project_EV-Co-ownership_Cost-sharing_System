package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.pojo.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface IScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByGroupMember_Group_GroupId(int groupId);

    long countByGroupMember_IdAndStatusAndCreatedAtBetween(
            int groupMemberId,
            String status,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Schedule> findByGroupMember_Group_GroupIdAndStatus(int groupId, String status);
}
