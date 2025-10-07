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



}
