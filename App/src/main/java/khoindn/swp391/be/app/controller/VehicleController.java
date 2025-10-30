package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.pojo.Vehicle;
import khoindn.swp391.be.app.service.IVehicleService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:8081")
@RequestMapping("/vehicle")
@SecurityRequirement(name = "api")
public class VehicleController {

    @Autowired
    private IVehicleService iVehicleService;

    @GetMapping("/")
    public ResponseEntity<List<Vehicle>> getAllUnregisteredVehicleAndPending() {
        List<Vehicle> vehicles = iVehicleService.getAllUnregisteredVehicle();
        return ResponseEntity.status(HttpStatus.OK).body(vehicles);
    }

    @GetMapping("/getVehicleByGroupID/{groupId}")
    public ResponseEntity<Vehicle> getVehicleByGroupID(@PathVariable int groupId) {
        Vehicle vehicle = iVehicleService.findVehicleByGroupId(groupId);
        return ResponseEntity.status(HttpStatus.OK).body(vehicle);
    }

}
