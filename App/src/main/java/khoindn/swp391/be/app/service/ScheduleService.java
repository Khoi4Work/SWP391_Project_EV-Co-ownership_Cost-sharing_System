package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.VehicleNotBelongException;
import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
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
        Users user = iUserRepository.findById(req.getUserId()).get();

        Group group = iGroupRepository.findById(req.getGroupId()).get();

        GroupMember gm = iGroupMemberRepository.findByGroupAndUsers(group, user).get();

        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(req.getVehicleId());
        // check car in group
        if (vehicle.getGroup().getGroupId() != (req.getGroupId())) {
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
    public Vehicle getCarByGroupIdAndUserId(int groupId, int userId) {
        // Lấy user
        Users user = iUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy group
        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Kiểm tra user có trong group khôngx`
        GroupMember gm = iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new RuntimeException("User does not belong to this group"));

        // Lấy danh sách vehicle của group
        Vehicle vehicles = iVehicleRepository.findByGroup(group);

        if (vehicles == null) {
            throw new RuntimeException("No vehicles found in this group");
        }

        return vehicles;
    }


}
