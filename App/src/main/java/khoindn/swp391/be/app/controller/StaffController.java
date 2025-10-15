package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.service.GroupService;
import khoindn.swp391.be.app.service.IGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/staff")
@SecurityRequirement(name = "api")
public class StaffController {
    @Autowired
    private IGroupService iGroupService;

    @PostMapping("/delete-group")
    public void deleteGroup(@RequestParam int groupId) {
        iGroupService.deleteGroup(groupId);
    }


}
