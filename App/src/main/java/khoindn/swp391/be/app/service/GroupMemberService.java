package khoindn.swp391.be.app.service;

import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.exception.exceptions.*;
import khoindn.swp391.be.app.model.Request.DecisionVoteReq;
import khoindn.swp391.be.app.model.Request.EmailDetailReq;
import khoindn.swp391.be.app.model.Response.AllGroupsOfMember;
import khoindn.swp391.be.app.model.Response.DecisionVoteRes;
import khoindn.swp391.be.app.model.Response.GroupMemberDetailRes;
import khoindn.swp391.be.app.model.formatData.VoteDetails;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.OptionDecisionVoteDetail;
import khoindn.swp391.be.app.pojo._enum.StatusDecisionVote;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import khoindn.swp391.be.app.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupMemberService implements IGroupMemberService {

    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;

    // ---------------------- NEW REPO INJECTION ----------------------
    @Autowired
    private IGroupRepository iGroupRepository;

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IDecisionVoteRepository iDecisionVoteRepository;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IDecisionVoteDetailRepository iDecisionVoteDetailRepository;
    @Autowired
    private IVehicleService iVehicleService;
    @Autowired
    private EmailService emailService;


    // ---------------------- EXISTING CODE ----------------------
    @Override
    public List<GroupMember> findAllByUsersId(int userId) {
        return iGroupMemberRepository.findAllByUsersId(userId);
    }

    @Override
    public List<Integer> getGroupIdsByUserId(int userId) {
        List<GroupMember> groupMembers = iGroupMemberRepository.findAllByUsersId(userId);
        return groupMembers.stream()
                .map(gm -> gm.getGroup().getGroupId())
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupMember> getMembersByGroupId(int groupId) {
        return iGroupMemberRepository.findAllByGroup_GroupId(groupId);
    }

    @Override
    public List<GroupMemberDetailRes> getGroupMembersByGroupId(int groupId) {
        List<GroupMember> groupMembers = iGroupMemberRepository.findByGroup_GroupId(groupId);

        return groupMembers.stream()
                .map(gm -> {
                    GroupMemberDetailRes res = new GroupMemberDetailRes();
                    res.setUserId(gm.getUsers().getId());
                    res.setRoleInGroup(gm.getRoleInGroup());
                    res.setOwnershipPercentage(gm.getOwnershipPercentage());
                    res.setId(gm.getId());
                    res.setGroupId(gm.getGroup().getGroupId());
                    res.setHovaten(gm.getUsers().getHovaTen());
                    return res;
                })
                .collect(Collectors.toList());
    }


    @Override
    public List<AllGroupsOfMember> getAllGroupsOfMember(Users user) {
        List<GroupMember> gm = iGroupMemberRepository.findAllByUsersId(user.getId())
                .stream()
                .filter(groupMember -> groupMember.getGroup().getStatus().equals(StatusGroup.ACTIVE))
                .toList();


        List<AllGroupsOfMember> res = new ArrayList<>();
        for (GroupMember each : gm) {
            AllGroupsOfMember agm = modelMapper.map(each, AllGroupsOfMember.class);

            agm.setMembers(iGroupMemberRepository.findAllByGroup_GroupId(each.getGroup().getGroupId())
                    .stream()
                    .filter(groupMember ->
                            !user.getId().equals(groupMember.getUsers().getId()))
                    .toList());

            res.add(agm);
        }
        return res;
    }

    @Override
    public GroupMember getGroupOwnerByGroupIdAndUserId(int groupId, int userId) {
        return iGroupMemberRepository.findGroupMembersByUsers_IdAndGroup_GroupId(userId, groupId);
    }


    @Override
    public DecisionVoteRes createDecision(DecisionVoteReq request, GroupMember gm) {
        DecisionVoteRes res = new DecisionVoteRes();

//        MenuVehicleService mvs = iVehicleService.getMenuVehicleServices()

        // map request to decisionVote
        DecisionVote createdDecisionVote = modelMapper.map(request, DecisionVote.class);
        createdDecisionVote.setEndedAt(LocalDateTime.now().plusDays(1));
        createdDecisionVote.setCreatedBy(gm);
        createdDecisionVote.setDecisionName(request.getDecisionNames());
        iDecisionVoteRepository.save(createdDecisionVote);

        res.setCreator(createdDecisionVote);

        Users user = authenticationService.getCurrentAccount();
        List<GroupMember> members = iGroupMemberRepository.findAllByGroup_GroupId(gm.getGroup().getGroupId())
                .stream()
                .filter(groupMember -> !groupMember.getUsers().getId().equals(user.getId()))
                .toList();


        for (GroupMember each : members) {
            DecisionVoteDetail voteDetail = new DecisionVoteDetail();
            voteDetail.setGroupMember(each);
            voteDetail.setDecisionVote(createdDecisionVote);
            iDecisionVoteDetailRepository.save(voteDetail);
        }


        res.setVoters(iDecisionVoteDetailRepository.getAllByDecisionVote(createdDecisionVote));

        return res;
    }

    @Override
    public DecisionVote setDecision(int choice, long idDecision, int serviceId, GroupMember gm) {
        DecisionVote vote = iDecisionVoteRepository.getDecisionVoteById(idDecision);

        if (vote == null) {
            throw new DecisionVoteNotFoundException("DECISION_NOT_FOUND_OR_DECISION_NOT_EXISTS");
        }

        DecisionVoteDetail voteDetail =
                iDecisionVoteDetailRepository.getDecisionVoteDetailByGroupMemberAndDecisionVote_Id(gm, idDecision);
        if (voteDetail == null) {
            throw new DecisionVoteDetailNotFoundException("VOTER_NOT_FOUND_OR_VOTER_NOT_EXISTS");
        }
        System.out.println(vote.getDecisionName());

        switch (choice) {
            case 0:
                voteDetail.setOptionDecisionVote(OptionDecisionVoteDetail.REJECTED);
                break;
            case 1:
                voteDetail.setOptionDecisionVote(OptionDecisionVoteDetail.ACCEPTED);
                break;
            case 2:
                voteDetail.setOptionDecisionVote(OptionDecisionVoteDetail.ABSENT);
            default:
                throw new UndefinedChoiceException("Choice is invalid!");
        }

        //Mô hình này được áp dụng phổ biến trong các hợp tác xã, công ty cổ phần,
        // tổ hợp tác, và DAO (Decentralized Autonomous Organization) trong blockchain.
        //
        //Ở Việt Nam: Luật Doanh nghiệp 2020 – Điều 148 quy định
        // “Nghị quyết được thông qua nếu số cổ phần tán thành chiếm ít nhất 65% tổng số phiếu biểu quyết”
        // (có thể điều chỉnh tỷ lệ theo điều lệ).
        //
        //→ Tức là 65%–75% là mức hợp lý, tùy bạn chọn.

        // Lưu lại chi tiết vote
        iDecisionVoteDetailRepository.save(voteDetail);

        // check voters's vote and request if vote is accepted
        if (checkAllVoters(vote, gm.getGroup().getGroupId(), serviceId).getStatus().equals(StatusDecisionVote.CONFIRMED)) {
            Context context = new Context();
            EmailDetailReq emailDetailReq = new EmailDetailReq();
            List<VoteDetails> voteDetails = new ArrayList<>();
            for (DecisionVoteDetail detail : vote.getDecisionVoteDetails()) {
                VoteDetails vd = new VoteDetails();
                vd.setOptionDecisionVote(detail.getOptionDecisionVote().name());
                vd.setVotedAt(detail.getVotedAt());
                vd.setGroupMember(detail.getGroupMember());
                voteDetails.add(vd);
            }


            emailDetailReq.setSubject("[EcoShare][Notification] Decision is confirmed!");
            emailDetailReq.setTemplate("decisionConfirmation");
            emailDetailReq.setEmail(vote.getCreatedBy().getUsers().getEmail());
            context.setVariable("creator", vote.getCreatedBy().getUsers());
            context.setVariable("decision", vote);
            context.setVariable("allVoteDetails", voteDetails);
            context.setVariable("totalApproved", voteDetails.stream().filter(
                            voteDetails1 ->
                                    voteDetails1
                                            .getOptionDecisionVote()
                                            .equals(OptionDecisionVoteDetail.ACCEPTED.name()))
                    .count());

            context.setVariable("totalReject",
                    voteDetails
                            .stream()
                            .filter(
                                    voteDetails1 ->
                                            voteDetails1
                                                    .getOptionDecisionVote()
                                                    .equals(OptionDecisionVoteDetail.REJECTED.name()))
                            .count());
            emailDetailReq.setContext(context);
            emailService.sendEmail(emailDetailReq);
        }

        return vote;
    }

    @Override
    public DecisionVote checkAllVoters(DecisionVote vote, int groupId, int serviceId) {
        // Lấy toàn bộ danh sách phiếu cho quyết định này
        List<DecisionVoteDetail> voteDetails = iDecisionVoteDetailRepository.getAllByDecisionVote(vote);


        if (LocalDateTime.now().isAfter(vote.getEndedAt()) ||
                voteDetails.stream().noneMatch(
                        v -> v.getOptionDecisionVote() == OptionDecisionVoteDetail.ABSENT)) {

            if (voteDetails.stream().anyMatch(
                    v -> v.getOptionDecisionVote() == OptionDecisionVoteDetail.ABSENT)) {
                for (DecisionVoteDetail detail : voteDetails) {
                    if (detail.getOptionDecisionVote() == OptionDecisionVoteDetail.ABSENT) {
                        detail.setOptionDecisionVote(OptionDecisionVoteDetail.REJECTED);
                        iDecisionVoteDetailRepository.save(detail);
                    }
                }
            }
            vote.setStatus(StatusDecisionVote.CONFIRMED);
            iVehicleService.requestVehicleService(groupId, serviceId, vote.getId());

            iDecisionVoteRepository.save(vote);

        }
        return vote;
    }

    @Override
    public DecisionVote getDecisionVoteById(long id) {
        return iDecisionVoteRepository.getDecisionVoteById(id);
    }

    @Override
    public List<DecisionVoteDetail> getAllDecisionVoteDetailByDecisionVote(DecisionVote decisionVote) {
        return iDecisionVoteDetailRepository.findAllByDecisionVote(decisionVote);
    }

    @Override
    public DecisionVoteDetail getDecisionVoteDetailByGroupMemberAndDecision(GroupMember groupMember, long decisionId) {
        return iDecisionVoteDetailRepository.findByGroupMemberAndDecisionVote_Id(groupMember, decisionId);
    }


}
