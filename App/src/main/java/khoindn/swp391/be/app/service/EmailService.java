package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.OtpSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService implements IEmailService{

    @Autowired
    private JavaMailSender javaMailSender;

    @Override
    public void sendEmail(OtpSender otpSender) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(otpSender.getEmail());
        message.setSubject("[EcoShare System][OPT]");
        message.setText("OPT cua ban la: "+ otpSender.getOtp());
        javaMailSender.send(message);
    }
}
