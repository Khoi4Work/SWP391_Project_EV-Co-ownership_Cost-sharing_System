package khoindn.swp391.be.app.repository;

import khoindn.swp391.be.app.pojo.DecisionVoteDetail;
import khoindn.swp391.be.app.pojo.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IDecisionVoteDetailRepository extends JpaRepository<DecisionVoteDetail, Long>
{
    DecisionVoteDetail getDecisionVoteDetailByGroupMember(GroupMember groupMember);

    DecisionVoteDetail getDecisionVoteDetailByGroupMemberAndDecisionVote_Id(GroupMember groupMember, Long decisionVoteId);
}
