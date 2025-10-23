package khoindn.swp391.be.app.controller;

import khoindn.swp391.be.app.model.Request.ContentSender;
import khoindn.swp391.be.app.service.IEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email")
@CrossOrigin(origins = "http://localhost:8081")
public class EmailController {

    @Autowired
    private IEmailService  iEmailService;

    @PostMapping("/send-otp")
    public void sendEmail(@RequestBody ContentSender contentSender) {
        System.out.println(contentSender);
        iEmailService.sendEmail(contentSender);
    }
}
