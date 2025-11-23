package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.RequestGroupNotFoundException;
import khoindn.swp391.be.app.exception.exceptions.UndefinedChoiceException;
import khoindn.swp391.be.app.model.Request.UpdateRequestGroup;
import khoindn.swp391.be.app.pojo.RequestGroupService;
import khoindn.swp391.be.app.pojo.RequestGroupServiceDetail;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.pojo._enum.StatusRequestGroup;
import khoindn.swp391.be.app.pojo._enum.StatusRequestGroupDetail;
import khoindn.swp391.be.app.repository.IRequestGroupServiceDetailRepository;
import khoindn.swp391.be.app.repository.IRequestGroupServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RequestGroupService_ implements IRequestGroupService {

    @Autowired
    private IRequestGroupServiceRepository iRequestGroupServiceRepository;
    @Autowired
    private IRequestGroupServiceDetailRepository iRequestGroupServiceDetailRepository;

    @Override
    public List<khoindn.swp391.be.app.pojo.RequestGroupService> getAllRequestGroup() {
        return iRequestGroupServiceRepository.findAll().stream()
                .filter(requestGroup ->
                        requestGroup.getRequestGroupServiceDetail().getStatus()
                                .equals(StatusRequestGroupDetail.PENDING))
                .toList();
    }

    @Override
    public void updateRequestGroup(UpdateRequestGroup update, Users staff) {
        RequestGroupService req = iRequestGroupServiceRepository.findRequestGroupById(update.getIdRequestGroup());
        RequestGroupServiceDetail detail = req.getRequestGroupServiceDetail();
        if (req == null) {
            throw new RequestGroupNotFoundException("RequestGroupService_ not found");
        }

        if (update.getIdChoice() == 1) {
            req.setStatus(StatusRequestGroup.SOLVED);
            detail.setStaff(staff);
            detail.setStatus(StatusRequestGroupDetail.APPROVED);
            detail.setSolvedAt(LocalDateTime.now());
            iRequestGroupServiceRepository.save(req);
            iRequestGroupServiceDetailRepository.save(detail);
        } else if (update.getIdChoice() == 0) {
            req.setStatus(StatusRequestGroup.DENIED);
            detail.setStaff(staff);
            detail.setStatus(StatusRequestGroupDetail.REJECTED);
            detail.setSolvedAt(LocalDateTime.now());
            iRequestGroupServiceRepository.save(req);
            iRequestGroupServiceDetailRepository.save(detail);
        } else if (update.getIdChoice() == 2) {
            req.setStatus(StatusRequestGroup.PROCESSING);
            detail.setStaff(staff);
            detail.setStatus(StatusRequestGroupDetail.PROCESSING);
            detail.setSolvedAt(LocalDateTime.now());
            iRequestGroupServiceRepository.save(req);
            iRequestGroupServiceDetailRepository.save(detail);
        } else {
            throw new UndefinedChoiceException("Undefined Choice");

        }
    }
}
