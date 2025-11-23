package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.GroupCreateReq;
import khoindn.swp391.be.app.model.Request.GroupRequest;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.pojo.RequestGroupService;
import khoindn.swp391.be.app.pojo.VehicleService;
import khoindn.swp391.be.app.pojo.Users;

import java.util.List;

public interface IGroupService {
    RegisterVehicleRes addMemberToGroupByContract(GroupCreateReq request);

    void deleteGroup(int groupId);

    void createRequestGroup(GroupRequest request, Users user);

    Group getGroupById(int groupId);

    VehicleService getAllVehicleServiceByGroupId(int groupId);

    List<RequestGroupService> getAllRequestGroups();

    List<Group> getAllGroups();
}
