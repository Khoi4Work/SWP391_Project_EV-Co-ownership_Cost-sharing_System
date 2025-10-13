package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.OtpSender;

public interface IEmailService {

    public void sendEmail(OtpSender sender);
}
