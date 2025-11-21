// trong /controller/AdminStaffController.java
package khoindn.swp391.be.app.controller;

import khoindn.swp391.be.app.model.Request.CreateStaffRequest;
import khoindn.swp391.be.app.model.Request.UpdateStaffRequest;
import khoindn.swp391.be.app.model.Response.StaffResponse;
import khoindn.swp391.be.app.service.IStaffManagementService;
import khoindn.swp391.be.app.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/staff") // Đường dẫn gốc
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private IStaffManagementService staffService;

    @PostMapping("/create")
    public ResponseEntity<StaffResponse> createStaff(@RequestBody CreateStaffRequest request) {
        StaffResponse newStaff = staffService.createStaff(request);
        return new ResponseEntity<>(newStaff, HttpStatus.CREATED);
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        List<StaffResponse> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

//    @GetMapping("/getUserStatusBlock")
//    public ResponseEntity<List<Users>> getUserStatusBlock() {
//        List<Users> users = iUserService.getAllUsersByStatus();
//        return ResponseEntity.ok(users);
//    }

//    @PutMapping("/users/{id}/unblock")
//    public ResponseEntity<String> unblockUser(@PathVariable int id) {
//        iUserService.unblockUser(id);
//        return ResponseEntity.ok("Đã mở khóa tài khoản thành công");
//    }

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<StaffResponse> getStaffById(@PathVariable Integer id) {
        StaffResponse staff = staffService.getStaffById(id);
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<StaffResponse> updateStaff(@PathVariable Integer id, @RequestBody UpdateStaffRequest request) {
        StaffResponse updatedStaff = staffService.updateStaff(id, request);
        return ResponseEntity.ok(updatedStaff);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok("Đã xóa thành công Staff với ID: " + id);
    }
}