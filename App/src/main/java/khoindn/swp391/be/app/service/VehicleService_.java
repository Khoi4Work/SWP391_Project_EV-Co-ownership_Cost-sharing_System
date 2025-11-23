package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.exception.exceptions.DecisionVoteNotFoundException;
import khoindn.swp391.be.app.exception.exceptions.GroupMemberNotFoundException;
import khoindn.swp391.be.app.exception.exceptions.VehicleIsNotExistedException;
import khoindn.swp391.be.app.pojo.*;
import khoindn.swp391.be.app.pojo._enum.StatusGroup;
import khoindn.swp391.be.app.pojo._enum.StatusVehicle;
import khoindn.swp391.be.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VehicleService_ implements IVehicleService {

    @Autowired
    private IVehicleRepository iVehicleRepository;
    @Autowired
    private IMenuVehicleServiceRepository iMenuVehicleServiceRepository;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private IGroupMemberRepository iGroupMemberRepository;
    @Autowired
    private IRequestVehicleServiceRepository iRequestVehicleServiceRepository;
    @Autowired
    private IDecisionVoteRepository iDecisionVoteRepository;
    @Autowired
    private IVehicleService iVehicleService;

    @Override
    public Vehicle addVehicle(Vehicle vehicle) {
        return iVehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle findVehicleByModel(String name) {
        Vehicle vehicle = iVehicleRepository.findVehicleByModel(name);
        if (vehicle == null) {
            throw new VehicleIsNotExistedException("Vehicle with model '" + name + "' not found");
        }
        return vehicle;
    }

    @Override
    public List<Vehicle> findAll() {
        return iVehicleRepository.findAll();
    }

    @Override
    public Vehicle findVehicleById(int id) {
        Vehicle vehicle = iVehicleRepository.findVehicleByVehicleId(id);
        if (vehicle == null) {
            throw new VehicleIsNotExistedException("Vehicle with id " + id + " not found");
        }
        return vehicle;
    }


    @Override
    public Vehicle findVehicleByGroupId(int groupId) {
        return iVehicleRepository.findVehicleByGroup_GroupId(groupId);
    }

    @Override
    public MenuVehicleService addVehicleService(MenuVehicleService vehicleService) {
        return iMenuVehicleServiceRepository.save(vehicleService);
    }

    @Override
    public List<MenuVehicleService> getMenuVehicleServices() {
        return iMenuVehicleServiceRepository.findAll();
    }

    @Override
    public VehicleService requestVehicleService(int groupId, int serviceId, long voteId) {
        Users user = authenticationService.getCurrentAccount();
        GroupMember gm = iGroupMemberRepository.findGroupMembersByUsers_IdAndGroup_GroupId(user.getId(), groupId);
        DecisionVote dv = iDecisionVoteRepository.findById(voteId).orElse(null);
        List<MenuVehicleService> menuVehicleService = getMenuVehicleServices();
        if (gm == null) {
            throw new GroupMemberNotFoundException("GROUP_NOT_FOUND");
        }
        if (dv == null) {
            throw new DecisionVoteNotFoundException("DECISION_VOTE_NOT_FOUND");
        }


        for (String decisionName : dv.getDecisionName()) {
            VehicleService vehicleService = new VehicleService();
            vehicleService.setGroupMember(gm);
            vehicleService.setDecisionVote(dv);
            vehicleService.setVehicle(iVehicleRepository.getVehiclesByGroup(gm.getGroup()));
            for (MenuVehicleService mvs : menuVehicleService) {
                if (mvs.getServiceName().equals(decisionName)) {
                    vehicleService.setMenuVehicleService(mvs);
                    break;
                } else if (mvs.getServiceName().equalsIgnoreCase("Others Service")) {
                    vehicleService.setMenuVehicleService(mvs);
                    break;
                }
            }
            iRequestVehicleServiceRepository.save(vehicleService);
        }


        return null;
    }

    @Override
    public List<khoindn.swp391.be.app.pojo.VehicleService> getAllRequestVehicleSerive() {
        return iRequestVehicleServiceRepository.findAll();
    }

    @Override
    public List<Vehicle> getVehicles() {
        return iVehicleRepository.findAll().stream()
                .filter(vehicle -> vehicle
                        .getStatusVehicle()
                        .equals(StatusVehicle.AVAILABLE))
                .filter(vehicle -> vehicle.getGroup().getStatus().equals(StatusGroup.ACTIVE))
                .toList();
    }


}
