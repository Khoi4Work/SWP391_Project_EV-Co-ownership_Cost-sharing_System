package khoindn.swp391.be.app.config;

import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.pojo.Vehicle;
import khoindn.swp391.be.app.service.UserRoleService;
import khoindn.swp391.be.app.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRoleService userRoleService;

    @Autowired
    private VehicleService vehicleService;

    @Override
    public void run(String... args) throws Exception {
// test again and again

        if (!userRoleService.existsByRoleName("user") ||
                !userRoleService.existsByRoleName("co-owner") ||
                !userRoleService.existsByRoleName("admin") ||
                !userRoleService.existsByRoleName("staff")) {

            UserRole userRole = new UserRole();
            userRole.setRole_id(1);
            userRole.setRoleName("user");
            userRoleService.addUserRole(userRole);

            UserRole coOwnerRole = new UserRole();
            coOwnerRole.setRole_id(2);
            coOwnerRole.setRoleName("co-owner");
            userRoleService.addUserRole(coOwnerRole);

            UserRole adminRole = new UserRole();
            adminRole.setRole_id(3);
            adminRole.setRoleName("admin");
            userRoleService.addUserRole(adminRole);

            UserRole staffRole = new UserRole();
            staffRole.setRole_id(4);
            staffRole.setRoleName("staff");
            userRoleService.addUserRole(staffRole);
        }

        if (vehicleService.findAll().isEmpty()) {
            Vehicle v1 = new Vehicle();
            v1.setPlateNo("29A-12345");
            v1.setBrand("Tesla");
            v1.setModel("Model S");
            v1.setColor("Red");
            v1.setBatteryCapacity(100);
            v1.setCreatedAt(LocalDateTime.now());
            v1.setPrice(150000); // thêm giá
            vehicleService.addVehicle(v1);

            Vehicle v2 = new Vehicle();
            v2.setPlateNo("30B-67890");
            v2.setBrand("VinFast");
            v2.setModel("VF8");
            v2.setColor("Blue");
            v2.setBatteryCapacity(90);
            v2.setCreatedAt(LocalDateTime.now());
            v2.setPrice(80000); // thêm giá
            vehicleService.addVehicle(v2);

            Vehicle v3 = new Vehicle();
            v3.setPlateNo("31C-54321");
            v3.setBrand("Nissan");
            v3.setModel("Leaf");
            v3.setColor("White");
            v3.setBatteryCapacity(60);
            v3.setCreatedAt(LocalDateTime.now());
            v3.setPrice(40000); // thêm giá
            vehicleService.addVehicle(v3);

            Vehicle v4 = new Vehicle();
            v4.setPlateNo("32D-11223");
            v4.setBrand("BYD");
            v4.setModel("Han");
            v4.setColor("Black");
            v4.setBatteryCapacity(85);
            v4.setCreatedAt(LocalDateTime.now());
            v4.setPrice(35000); // thêm giá
            vehicleService.addVehicle(v4);

            Vehicle v5 = new Vehicle();
            v5.setPlateNo("33E-44556");
            v5.setBrand("Porsche");
            v5.setModel("Taycan");
            v5.setColor("Silver");
            v5.setBatteryCapacity(93);
            v5.setCreatedAt(LocalDateTime.now());
            v5.setPrice(120000); // thêm giá
            vehicleService.addVehicle(v5);
        }


    }
}
