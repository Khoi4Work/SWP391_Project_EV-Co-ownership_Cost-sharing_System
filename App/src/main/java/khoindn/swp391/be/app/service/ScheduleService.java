package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.*;
import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.model.Response.VehicleRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService implements IScheduleService {
    @Autowired
    private IScheduleRepository iScheduleRepository;

    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserRepository iUserRepository;
    @Autowired
    private IGroupRepository iGroupRepository;
    @Autowired
    private IVehicleRepository iVehicleRepository;

    @Override
    public ScheduleRes createSchedule(ScheduleReq req) {
        Users user = iUserRepository.findById(req.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Group group = iGroupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        GroupMember gm = iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new UserNotBelongException("User does not belong to this group"));

        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(req.getVehicleId());
        if (vehicle == null || vehicle.getGroup().getGroupId() != req.getGroupId()) {
            throw new VehicleNotBelongException("Vehicle does not belong to this group");
        }

        Schedule schedule = new Schedule();
        schedule.setStartTime(req.getStartTime());
        schedule.setEndTime(req.getEndTime());
        schedule.setStatus("pending");
        schedule.setGroupMember(gm);

        Schedule saved = iScheduleRepository.save(schedule);

        ScheduleRes res = modelMapper.map(saved, ScheduleRes.class);
        res.setUserId(user.getId());
        res.setGroupId(group.getGroupId());
        res.setVehicleId(vehicle.getVehicleId());

        return res;
    }


    @Override
    public List<ScheduleRes> getAllSchedules() {
        return iScheduleRepository.findAll().stream()
                .map(s -> {
                    ScheduleRes res = modelMapper.map(s, ScheduleRes.class);
                    res.setUserId(s.getGroupMember().getUsers().getId());
                    res.setGroupId(s.getGroupMember().getGroup().getGroupId());
                    Vehicle vehicle = iVehicleRepository.findByGroup(s.getGroupMember().getGroup());
                    if (vehicle != null) {
                        res.setVehicleId(vehicle.getVehicleId());
                    }
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public VehicleRes getCarByGroupIdAndUserId(int groupId, int userId) {
        Users user = iUserRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new UserNotBelongException("User does not belong to this group"));

        Vehicle vehicle = iVehicleRepository.findByGroup(group);
        if (vehicle == null) {
            throw new NoVehicleInGroupException("No vehicles found in this group");
        }

        VehicleRes dto = modelMapper.map(vehicle, VehicleRes.class);
        dto.setGroupId(group.getGroupId());
        dto.setGroupName(group.getGroupName());

        return dto;
    }

    @Override
    public void updateSchedule(ScheduleReq req, int scheduleId) {
        // Find existing schedule
        Schedule schedule = iScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Validate user exists
        Users user = iUserRepository.findById(req.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Validate group exists
        Group group = iGroupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        // Validate user belongs to group
        GroupMember gm = iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new UserNotBelongException("User does not belong to this group"));

        // Validate vehicle belongs to group
        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(req.getVehicleId());
        if (vehicle == null || vehicle.getGroup().getGroupId() != req.getGroupId()) {
            throw new VehicleNotBelongException("Vehicle does not belong to this group");
        }

        // Update schedule fields
        schedule.setStartTime(req.getStartTime());
        schedule.setEndTime(req.getEndTime());
        schedule.setGroupMember(gm);
        schedule.getGroupMember().getGroup().setVehicles((List<Vehicle>) vehicle);

        // Save updated schedule
        iScheduleRepository.save(schedule);
    }

    @Override
    public void deleteSchedule(int scheduleId) {
        Schedule schedule = iScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        iScheduleRepository.delete(schedule);
    }

    @Override
    public List<ScheduleRes> findByGroupMember_Group_GroupId(int groupId) {
        // Validate group exists
        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        List<Schedule> schedules = iScheduleRepository.findByGroupMember_Group_GroupId(groupId);

        // Convert entities to DTOs
        return schedules.stream()
                .map(schedule -> {
                    ScheduleRes res = modelMapper.map(schedule, ScheduleRes.class);
                    res.setUserId(schedule.getGroupMember().getUsers().getId());
                    res.setGroupId(schedule.getGroupMember().getGroup().getGroupId());

                    // Get vehicle for this schedule's group
                    Vehicle vehicle = iVehicleRepository.findByGroup(schedule.getGroupMember().getGroup());
                    if (vehicle != null) {
                        res.setVehicleId(vehicle.getVehicleId());
                    }

                    return res;
                })
                .collect(Collectors.toList());
    }


}
