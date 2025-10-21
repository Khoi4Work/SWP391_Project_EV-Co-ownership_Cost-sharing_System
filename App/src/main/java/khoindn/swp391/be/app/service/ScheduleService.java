package khoindn.swp391.be.app.service;

import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.*;
import khoindn.swp391.be.app.model.Request.ContentSender;
import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.OverrideInfoRes;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.model.Response.VehicleRes;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import java.util.stream.Collectors;

@Service
@Transactional
public class ScheduleService implements IScheduleService {
    @Autowired
    private IScheduleRepository iScheduleRepository;
    @Autowired
    private IEmailService emailService;
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

        LocalDateTime now = LocalDateTime.now();

        if (req.getStartTime().isBefore(now)) {
            throw new PastDateBookingException(
                    "Cannot book schedule in the past"
            );
        }

        if (req.getEndTime().isBefore(now)) {
            throw new PastDateBookingException(
                    "End time must be in the future"
            );
        }

        if (req.getEndTime().isBefore(req.getStartTime())) {
            throw new PastDateBookingException(
                    "End time must be after start time"
            );
        }
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

        // Find conflicting schedules
        List<Schedule> conflictingSchedules = iScheduleRepository
                .findByGroupMember_Group_GroupId(req.getGroupId())
                .stream()
                .filter(s -> !s.getStatus().equals("canceled") &&
                        !s.getStatus().equals("overridden") &&
                        !s.getStatus().equals("override_tracker"))
                .filter(s -> s.getStartTime().isBefore(req.getEndTime()) &&
                        s.getEndTime().isAfter(req.getStartTime()))
                .collect(Collectors.toList());

        // Handle conflicts with ownership priority
        if (!conflictingSchedules.isEmpty()) {
            LocalDateTime startOfMonth = LocalDateTime.now()
                    .withDayOfMonth(1)
                    .withHour(0)
                    .withMinute(0)
                    .withSecond(0);

            LocalDateTime endOfMonth = LocalDateTime.now()
                    .withDayOfMonth(LocalDateTime.now().toLocalDate().lengthOfMonth())
                    .withHour(23)
                    .withMinute(59)
                    .withSecond(59);

            long overrideCount = iScheduleRepository
                    .countByGroupMember_IdAndStatusAndCreatedAtBetween(
                            gm.getId(),
                            "override_tracker",
                            startOfMonth,
                            endOfMonth
                    );

            if (overrideCount >= 3) {
                throw new OverrideLimitExceededException(
                        "Override limit exceeded. You have used all 3 overrides this month. " +
                                "Next reset: " + startOfMonth.plusMonths(1).toLocalDate()
                );
            }

            // Process each conflicting schedule
            for (Schedule conflictSchedule : conflictingSchedules) {
                LocalDateTime scheduleStartTime = conflictSchedule.getStartTime();
                long hoursUntilStart = java.time.Duration.between(now, scheduleStartTime).toHours();
                if (hoursUntilStart < 24) {
                    throw new OverrideNotAllowedException(
                            "Cannot override schedule starting within 24 hours"
                    );
                }
                float existingOwnership = conflictSchedule.getGroupMember().getOwnershipPercentage();
                float newOwnership = gm.getOwnershipPercentage();

                if (newOwnership > existingOwnership) {
                    // Higher ownership -> override existing schedule
                    conflictSchedule.setStatus("overridden");
                    iScheduleRepository.save(conflictSchedule);

                    Schedule tracker = new Schedule();
                    tracker.setGroupMember(gm);
                    tracker.setStatus("override_tracker");
                    tracker.setStartTime(LocalDateTime.now());
                    tracker.setEndTime(LocalDateTime.now());
                    tracker.setCreatedAt(LocalDateTime.now());
                    iScheduleRepository.save(tracker);
                    Users affectedUser = conflictSchedule.getGroupMember().getUsers();
                    sendSimpleOverrideEmail(affectedUser, user, conflictSchedule);


                    System.out.println(String.format(
                            "Schedule overridden: User %s (%.1f%% ownership) overrode User %s (%.1f%% ownership)",
                            user.getUsername(),
                            newOwnership,
                            conflictSchedule.getGroupMember().getUsers().getUsername(),
                            existingOwnership
                    ));

                } else if (newOwnership == existingOwnership) {
                    throw new LowerOwnershipException(
                            "Cannot override schedule. Equal ownership percentage - first come first served principle applies"
                    );
                } else {
                    throw new LowerOwnershipException(
                            String.format(
                                    "Cannot override schedule. Your ownership (%.1f%%) is lower than existing booking (%.1f%%)",
                                    newOwnership,
                                    existingOwnership
                            )
                    );
                }
            }
        }

        Schedule schedule = new Schedule();
        schedule.setStartTime(req.getStartTime());
        schedule.setEndTime(req.getEndTime());
        schedule.setStatus("booked");
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
                .filter(s -> !s.getStatus().equals("override_tracker"))
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
    public List<VehicleRes> getCarsByGroupIdAndUserId(int groupId, int userId) {
        Users user = iUserRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new UserNotBelongException("User does not belong to this group"));

        List<Vehicle> vehicles = iVehicleRepository.findAllByGroup(group);

        if (vehicles.isEmpty()) {
            throw new NoVehicleInGroupException("No vehicles found in this group");
        }

        // Convert sang List<VehicleRes>
        return vehicles.stream()
                .map(vehicle -> {
                    VehicleRes dto = modelMapper.map(vehicle, VehicleRes.class);
                    dto.setGroupId(group.getGroupId());
                    dto.setGroupName(group.getGroupName());
                    return dto;
                })
                .collect(Collectors.toList());
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
    public void cancelSchedule(int scheduleId) {
        Schedule schedule = iScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Đổi status thay vì delete
        schedule.setStatus("canceled");
        iScheduleRepository.save(schedule);
    }

    @Override
    public List<ScheduleRes> findByGroupMember_Group_GroupId(int groupId) {
        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        List<Schedule> schedules = iScheduleRepository.findByGroupMember_Group_GroupId(groupId);

        return schedules.stream()
                .filter(s -> !s.getStatus().equals("override_tracker"))
                .map(schedule -> {
                    ScheduleRes res = modelMapper.map(schedule, ScheduleRes.class);
                    res.setUserId(schedule.getGroupMember().getUsers().getId());
                    res.setUserName(schedule.getGroupMember().getUsers().getUsername());
                    res.setGroupId(schedule.getGroupMember().getGroup().getGroupId());
                    res.setOwnershipPercentage(schedule.getGroupMember().getOwnershipPercentage());
                    Vehicle vehicle = iVehicleRepository.findByGroup(schedule.getGroupMember().getGroup());
                    if (vehicle != null) {
                        res.setVehicleId(vehicle.getVehicleId());
                    }

                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public OverrideInfoRes getOverrideCountForUser(int userId, int groupId) {
        Users user = iUserRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Group group = iGroupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        GroupMember gm = iGroupMemberRepository.findByGroupAndUsers(group, user)
                .orElseThrow(() -> new UserNotBelongException("User does not belong to this group"));

        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0);

        LocalDateTime endOfMonth = LocalDateTime.now()
                .withDayOfMonth(LocalDateTime.now().toLocalDate().lengthOfMonth())
                .withHour(23)
                .withMinute(59)
                .withSecond(59);

        long overrideCount = iScheduleRepository
                .countByGroupMember_IdAndStatusAndCreatedAtBetween(
                        gm.getId(),
                        "override_tracker",
                        startOfMonth,
                        endOfMonth
                );

        return new OverrideInfoRes(
                userId,
                groupId,
                overrideCount,
                3 - overrideCount,
                3,
                startOfMonth.getMonth().toString(),
                startOfMonth.plusMonths(1).toLocalDate());
    }

    private void sendSimpleOverrideEmail(Users affectedUser, Users overridingUser, Schedule canceledSchedule) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            String emailContent = String.format(
                    "<html><body>" +
                            "<p>Lịch của bạn tại thời điểm <strong>%s - %s</strong> đã bị <strong>%s</strong> chèn.</p>" +
                            "</body></html>",
                    canceledSchedule.getStartTime().format(formatter),
                    canceledSchedule.getEndTime().format(formatter),
                    overridingUser.getUsername()
            );

            ContentSender contentSender = new ContentSender();
            contentSender.setEmail(affectedUser.getEmail());
            contentSender.setSubject("[EcoShare] Thông báo chèn lịch");
            contentSender.setContent(emailContent);
            contentSender.setAttachmentPath(null);

            emailService.sendEmail(contentSender);

        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }


}
