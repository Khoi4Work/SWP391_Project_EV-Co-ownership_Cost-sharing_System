package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.MenuVehicleService;
import khoindn.swp391.be.app.pojo.VehicleService;
import khoindn.swp391.be.app.pojo.Vehicle;

import java.util.List;

public interface IVehicleService {
    public Vehicle addVehicle(Vehicle vehicle);

    public Vehicle findVehicleByModel(String name);

    public List<Vehicle> findAll();

    public Vehicle findVehicleById(int id);


    public Vehicle findVehicleByGroupId(int groupId);

    MenuVehicleService addVehicleService(MenuVehicleService vehicleService);

    List<MenuVehicleService> getMenuVehicleServices();

    VehicleService requestVehicleService(int groupId, int serviceId, long voteId);

    List<VehicleService> getAllRequestVehicleSerive();


    List<Vehicle> getVehicles();
}
