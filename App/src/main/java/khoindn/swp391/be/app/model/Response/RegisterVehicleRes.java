package khoindn.swp391.be.app.model.Response;

import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.UserRole;
import khoindn.swp391.be.app.pojo.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterVehicleRes {
    private List<UsersResponse> owners;

    int vehicleId;
    String plateNo;
    String brand;
    String model;
    String color;
    int batteryCapacity;
    LocalDateTime createdAt;
    private Group groupId;
}
