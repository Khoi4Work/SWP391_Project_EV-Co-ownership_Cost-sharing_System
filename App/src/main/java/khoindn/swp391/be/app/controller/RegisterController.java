package khoindn.swp391.be.app.controller;

import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.pojo.Group;
import khoindn.swp391.be.app.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Group")
public class RegisterController {



    @Autowired
    private GroupService groupService;

    @PostMapping("/register")
    public ResponseEntity<RegisterVehicleRes> registerCar
            (@RequestBody @Valid RegisterVehicleReq request) {
        RegisterVehicleRes group = groupService.addMemberToGroup(request);
        return ResponseEntity.ok(group);
    }
}
