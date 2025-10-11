package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.model.Response.VehicleRes;
import khoindn.swp391.be.app.pojo.Schedule;
import khoindn.swp391.be.app.pojo.Vehicle;

import java.util.List;

public interface IScheduleService {
    ScheduleRes createSchedule(ScheduleReq req);

    List<ScheduleRes> getAllSchedules();

    public VehicleRes getCarByGroupIdAndUserId(int groupId, int userId);

    public void updateSchedule(ScheduleReq req, int scheduleId);

    public void deleteSchedule(int scheduleId);
    List<ScheduleRes> findByGroupMember_Group_GroupId(int groupId);

}
