package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.Vehicle;
import khoindn.swp391.be.app.repository.IVehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService implements IVehicleService{

    @Autowired
    private IVehicleRepository iVehicleRepository;

    @Override
    public Vehicle addVehicle(Vehicle vehicle) {
        return iVehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle findVehicleByModel(String name) {
        return iVehicleRepository.findVehicleByModel(name);
    }

    @Override
    public List<Vehicle> findAll() {
        return iVehicleRepository.findAll();
    }

    @Override
    public Vehicle findVehicleById(int id) {
        return iVehicleRepository.findVehicleByVehicleId(id);
    }

    @Override
    public List<Vehicle> getAllUnregisteredVehicle() {
        return iVehicleRepository.findByGroupIsNull();
    }
}
