package khoindn.swp391.be.app.controller;

import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.service.IScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Schedule")
public class ScheduleController {

    @Autowired
    private IScheduleService scheduleService;


    @PostMapping("/register")
    public ResponseEntity<ScheduleRes> createSchedule(@Valid @RequestBody ScheduleReq req) {
        ScheduleRes res = scheduleService.createSchedule(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping
    public ResponseEntity<List<ScheduleRes>> getAllSchedules() {
        List<ScheduleRes> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/cars")
    public ResponseEntity<?> getCarsByGroupAndUser(
            @RequestParam int groupId,
            @RequestParam int userId) {
        return ResponseEntity.ok(scheduleService.getCarByGroupIdAndUserId(groupId, userId));
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<ScheduleRes> updateSchedule(@PathVariable Integer id,
//                                                      @RequestBody ScheduleReq req) {
//        return ResponseEntity.notFound().build();
//    }

}

