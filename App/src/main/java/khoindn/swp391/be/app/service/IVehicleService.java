package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.Vehicle;

import java.util.List;

public interface IVehicleService {
    public Vehicle addVehicle(Vehicle vehicle);

    public Vehicle findVehicleByModel(String name);

    public List<Vehicle> findAll();

    public Vehicle findVehicleById(int id);

    public List<Vehicle> getAllUnregisteredVehicle();

    public Vehicle findVehicleByGroupId(int groupId);
}
