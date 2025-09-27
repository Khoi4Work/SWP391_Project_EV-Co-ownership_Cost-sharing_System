package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.GroupMember;

public interface IGroupService {
    public RegisterVehicleRes addMemberToGroup(RegisterVehicleReq request);


}
