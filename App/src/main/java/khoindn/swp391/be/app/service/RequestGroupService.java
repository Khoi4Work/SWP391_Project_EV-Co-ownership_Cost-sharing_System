package khoindn.swp391.be.app.service;

import jakarta.persistence.Access;
import khoindn.swp391.be.app.pojo.RequestGroup;
import khoindn.swp391.be.app.repository.IRequestGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RequestGroupService implements IRequestGroupService {

    @Autowired
    private IRequestGroupRepository iRequestGroupRepository;

    @Override
    public List<RequestGroup> getAllRequestGroup() {
        return iRequestGroupRepository.findAll();
    }
}
