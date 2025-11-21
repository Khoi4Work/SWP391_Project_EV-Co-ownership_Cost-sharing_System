package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.VehicleService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IRequestVehicleServiceRepository extends JpaRepository<VehicleService,Long> {
    VehicleService getAllByGroupMember_Group(Group groupMemberGroup);
}
