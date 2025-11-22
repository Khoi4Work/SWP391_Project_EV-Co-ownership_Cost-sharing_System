package khoindn.swp391.be.app.model.formatData;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import khoindn.swp391.be.app.pojo.DecisionVote;
import khoindn.swp391.be.app.pojo.GroupMember;
import khoindn.swp391.be.app.pojo._enum.OptionDecisionVoteDetail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteDetails {

    private String optionDecisionVote ;

    private LocalDateTime votedAt;

    private GroupMember groupMember;

}
