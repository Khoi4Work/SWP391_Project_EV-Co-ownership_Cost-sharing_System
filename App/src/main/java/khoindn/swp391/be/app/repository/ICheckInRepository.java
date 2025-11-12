package khoindn.swp391.be.app.repository;


import khoindn.swp391.be.app.pojo.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICheckInRepository extends JpaRepository<CheckIn, Integer> {
    CheckIn findByScheduleScheduleId(int scheduleScheduleId);

    boolean existsBySchedule_ScheduleId(int scheduleScheduleId);

    List<CheckIn> findBySchedule_GroupMember_Users_Id(int userId);
}
