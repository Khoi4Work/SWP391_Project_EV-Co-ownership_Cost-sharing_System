package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IVehicleRepository extends JpaRepository<Vehicle, Integer> {

    public Vehicle findVehicleByModel(String model);

    public Vehicle findVehicleByVehicleId(int vehicleId);

    public Vehicle findByGroup(Group group);

    public List<Vehicle> findByGroupIsNull();


    Vehicle getVehiclesByVehicleId(int vehicleId);
}
