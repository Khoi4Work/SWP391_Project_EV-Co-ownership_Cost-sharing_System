package khoindn.swp391.be.app.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "vehicles")
@AllArgsConstructor
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "car_id")
    private int vehicleId;

    @Column(name = "plate_no", length = 32, nullable = false)
    private String plateNo;

    @Column(name = "brand", length = 32)
    private String brand;

    @Column(name = "model", length = 32)
    private String model;

    @Column(name = "color", length = 32)
    private String color;

    @Column(name = "battery_capacity")
    private int batteryCapacity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}
