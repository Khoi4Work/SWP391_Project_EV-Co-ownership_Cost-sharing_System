package khoindn.swp391.be.app.controller;

import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/Users")
@CrossOrigin(origins = "http://localhost:8081")


public class UserController {

    @Autowired
    private IUserService iUserService;

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Users>> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(iUserService.findUserById(id));
    }

    @PostMapping("/")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Users> addUser(@RequestBody Users users) {
        return ResponseEntity.ok(iUserService.addUser(users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Users> updateUser(@RequestBody Users users,
                                            @PathVariable int id) {
        return ResponseEntity.ok(iUserService.updateUser(users, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable int id) {
        iUserService.deleteUser(id);
        return ResponseEntity.ok("Delete successfully");
    }
}
