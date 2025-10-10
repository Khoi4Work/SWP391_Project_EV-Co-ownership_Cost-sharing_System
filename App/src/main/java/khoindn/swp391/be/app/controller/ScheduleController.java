package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.exception.exceptions.NoVehicleInGroupException;
import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.model.Response.VehicleRes;
import khoindn.swp391.be.app.service.IScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/Schedule")
@SecurityRequirement(name = "api")
@CrossOrigin(origins = "http://localhost:8081")

public class ScheduleController {

    @Autowired
    private IScheduleService scheduleService;


    @PostMapping("/register")
    public ResponseEntity<ScheduleRes> createSchedule(@Valid @RequestBody ScheduleReq req) {
        ScheduleRes res = scheduleService.createSchedule(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);

    }

    @GetMapping("/all")
    public ResponseEntity<List<ScheduleRes>> getAllSchedules() {

        List<ScheduleRes> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/vehicle")
    public ResponseEntity<VehicleRes> getCarsByGroupAndUser(
            @RequestParam int groupId,
            @RequestParam int userId) {
        VehicleRes res = scheduleService.getCarByGroupIdAndUserId(groupId, userId);
        System.out.println(res);
        if (res == null) {
            throw new NoVehicleInGroupException("No vehicle in user's group");
        }
        return ResponseEntity.ok(res);
    }

    @PutMapping("/update/{scheduleId}")
    public ResponseEntity<Void> updateSchedule(@PathVariable int scheduleId,
                                               @RequestBody ScheduleReq req) {
        scheduleService.updateSchedule(req, scheduleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable int scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }
//    @PutMapping("/{id}")
//    public ResponseEntity<ScheduleRes> updateSchedule(@PathVariable Integer id,
//                                                      @RequestBody ScheduleReq req) {
//        return ResponseEntity.notFound().build();
//    }

}

