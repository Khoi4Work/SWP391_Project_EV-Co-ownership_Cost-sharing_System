package khoindn.swp391.be.app.controller;

import jakarta.validation.Valid;
import khoindn.swp391.be.app.model.Request.EmailDetailReq;
import khoindn.swp391.be.app.model.Request.SendBulkEmailReq;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.context.Context;

@RestController
@RequestMapping("/email")
@CrossOrigin(origins = "http://localhost:8081")
public class EmailController {

    @Autowired
    private IEmailService  iEmailService;
    @Autowired
    private ContractService contractService;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private IUserService iUserService;

    @PostMapping("/send-otp")
    public ResponseEntity sendOtpViaEmail(@RequestBody EmailDetailReq contentSender) {
        System.out.println(contentSender);
        iEmailService.sendOtpViaEmail(contentSender);
        return  ResponseEntity.ok().body("Send email successfully");
    }

    @PostMapping("/send")
    public ResponseEntity sendEmail(@RequestBody EmailDetailReq contentSender) {
        System.out.println(contentSender);
        iEmailService.sendEmail(contentSender);
        return  ResponseEntity.ok().body("Send email successfully");
    }

    @PostMapping("/send/vote/decision")
    public ResponseEntity sendEmailVoteDecisision(@RequestBody EmailDetailReq contentSender) {
        System.out.println(contentSender);
        Users user =  iUserService.getUserByEmail(contentSender.getEmail());
        System.out.println(user);
        String tokenVote = tokenService.generateToken(user);
        contentSender.setUrl(contentSender.getUrl() + "?token=" + tokenVote);

        Context context = new  Context();
        context.setVariable("confirmUrl",contentSender.getUrl());
        context.setVariable("userName", user.getHovaTen());

        contentSender.setContext(context);
        contentSender.setTemplate("voting-notification");
        iEmailService.sendEmail(contentSender);
        return  ResponseEntity.ok().body("Send email successfully");
    }

    // Gửi email
    @PostMapping("/bulk/send")
    public ResponseEntity<String> sendEmail(@RequestBody @Valid SendBulkEmailReq emailReq) {
        try {
            iEmailService.SendBulkEmail(emailReq);
            return ResponseEntity.status(HttpStatus.OK).body("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }
}
