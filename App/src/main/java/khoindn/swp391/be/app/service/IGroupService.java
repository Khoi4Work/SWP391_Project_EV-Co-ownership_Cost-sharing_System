package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.GroupCreateReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;

public interface IGroupService {
    public RegisterVehicleRes addMemberToGroup(GroupCreateReq request);


}
