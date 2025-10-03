package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ScheduleReq;
import khoindn.swp391.be.app.model.Response.ScheduleRes;
import khoindn.swp391.be.app.pojo.Vehicle;

import java.util.List;

public interface IScheduleService {
    ScheduleRes createSchedule(ScheduleReq req);

    List<ScheduleRes> getAllSchedules();

    public Vehicle getCarByGroupIdAndUserId(int groupId, int userId);
}
