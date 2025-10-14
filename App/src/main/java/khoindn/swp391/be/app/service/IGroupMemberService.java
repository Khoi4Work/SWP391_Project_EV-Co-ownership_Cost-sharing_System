package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.GroupMember;

import java.util.List;

public interface IGroupMemberService {
    public List<GroupMember> findAllByUsersId(int userId);

    List<Integer> getGroupIdsByUserId(int userId);

    List<GroupMember> getMembersByGroupId(int groupId);

    GroupMember getGroupOwnerByGroupIdAndUserId(int groupId,  int userId);

}
