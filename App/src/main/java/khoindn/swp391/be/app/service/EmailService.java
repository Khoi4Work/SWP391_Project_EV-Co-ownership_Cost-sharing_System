package khoindn.swp391.be.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import khoindn.swp391.be.app.model.Request.EmailDetailReq;
import khoindn.swp391.be.app.model.Request.SendBulkEmailReq;
import khoindn.swp391.be.app.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@Transactional
public class EmailService implements IEmailService {

    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private IUserRepository iUserRepository;
    @Autowired
    private SpringTemplateEngine templateEngine;

    @Override
    public void sendEmail(EmailDetailReq contentSender) {

        if (contentSender.getContext()!= null){
            contentSender.setTemplate(templateEngine.process(contentSender.getTemplate(), contentSender.getContext()));
        }
        try {
            // MimeMessage cho phép gửi HTML + file đính kèm
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();

            // true = multipart message (cho phép đính kèm file)
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(contentSender.getEmail());
            helper.setSubject(contentSender.getSubject());
            helper.setText(contentSender.getTemplate(), true); // true = nội dung HTML


            javaMailSender.send(mimeMessage);
            System.out.println("✅ Email sent successfully to " + contentSender.getEmail());

        } catch (MessagingException e) {
            e.printStackTrace();
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public void SendBulkEmail(SendBulkEmailReq emailReq) {
        for (String eachEmail : emailReq.getEmail()) {
            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setTo(eachEmail);
                helper.setSubject(emailReq.getSubject());
                helper.setText(emailReq.getTemplate(), true);

                javaMailSender.send(message);
            } catch (Exception e) {
                e.getMessage();
            }
        }
    }

    @Override
    public void sendOtpViaEmail(EmailDetailReq sender) {
        Context context = new Context();
        context.setVariable("loginUrl", "http://localhost:8081/login");
        context.setVariable("name", sender.getName());
        context.setVariable("appName", "EcoShare");
        context.setVariable("email", sender.getEmail());
        context.setVariable("otp", sender.getContent());
        String template = templateEngine.process("otp", context);
        sender.setTemplate(template);
        sender.setContext(context);
        sender.setSubject("[EcoShare System] Verify Account");
        sendEmail(sender);
    }

    @Override
    public void sendContractViaEmail(EmailDetailReq req) {
        Context context = new Context();
        context.setVariable("secureUrl", req.getUrl());
        String template = templateEngine.process(req.getTemplate(), context);
        req.setTemplate(template);
        sendEmail(req);
    }


}
