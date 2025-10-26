package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Response.ScheduleListItemResponse;
import khoindn.swp391.be.app.pojo.CheckIn;
import khoindn.swp391.be.app.pojo.CheckOut;
import khoindn.swp391.be.app.pojo.Schedule;
import khoindn.swp391.be.app.pojo.Vehicle;
import khoindn.swp391.be.app.repository.ICheckInRepository;
import khoindn.swp391.be.app.repository.ICheckOutRepository;
import khoindn.swp391.be.app.repository.IScheduleRepository;
import khoindn.swp391.be.app.repository.IVehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleCheckInOutService {
    @Autowired
    private IScheduleRepository iScheduleRepository;
    @Autowired
    private ICheckInRepository iCheckInRepository;
    @Autowired
    private ICheckOutRepository iCheckOutRepository;
    @Autowired
    private IVehicleRepository iVehicleRepository;

    public List<ScheduleListItemResponse> getSchedulesByGroup(int groupId) {
        List<Schedule> schedules = iScheduleRepository
                .findByGroupMember_Group_GroupIdAndStatus(groupId, "booked");

        return schedules.stream()
                .map(schedule -> {
                    ScheduleListItemResponse res = new ScheduleListItemResponse();
                    res.setScheduleId(schedule.getScheduleId());
                    res.setStartTime(schedule.getStartTime());
                    res.setEndTime(schedule.getEndTime());

                    // Vehicle info
                    Vehicle vehicle = iVehicleRepository.findByGroup(schedule.getGroupMember().getGroup());
                    if (vehicle != null) {
                        res.setVehicleName(vehicle.getBrand() + " " + vehicle.getModel());
                        res.setVehiclePlate(vehicle.getPlateNo());
                    }

                    // User info
                    if (schedule.getGroupMember().getUsers() != null) {
                        res.setUserName(schedule.getGroupMember().getUsers().getHovaTen());
                    }

                    // Check-in status
                    CheckIn checkIn = iCheckInRepository.findByScheduleScheduleId(schedule.getScheduleId());
                    res.setHasCheckIn(checkIn != null);
                    if (checkIn != null) {
                        res.setCheckInTime(checkIn.getCheckInTime());
                    }

                    // Check-out status
                    CheckOut checkOut = iCheckOutRepository.findByScheduleScheduleId((schedule.getScheduleId()));
                    res.setHasCheckOut(checkOut != null);
                    if (checkOut != null) {
                        res.setCheckOutTime(checkOut.getCheckOutTime());
                    }

                    return res;
                })
                .collect(Collectors.toList());
    }
}

