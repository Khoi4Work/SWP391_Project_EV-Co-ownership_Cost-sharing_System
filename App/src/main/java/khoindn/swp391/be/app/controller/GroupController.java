package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/group")
@SecurityRequirement(name = "api")


public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/register")
    public ResponseEntity<RegisterVehicleRes> registerCar
            (@RequestBody @Valid RegisterVehicleReq request) {
        RegisterVehicleRes group = groupService.addMemberToGroup(request);
        return ResponseEntity.status(201).body(group); // 201 Created
    }

}
