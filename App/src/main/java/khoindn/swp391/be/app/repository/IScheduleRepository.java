package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IScheduleRepository extends JpaRepository<Schedule, Integer> {
}
