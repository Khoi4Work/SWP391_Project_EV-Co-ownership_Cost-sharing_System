package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ContentSender;
import khoindn.swp391.be.app.model.Request.SendEmailReq;

public interface IEmailService {

    public void sendEmail(ContentSender sender);
    public void SendBulkEmail(SendEmailReq emailReq);
}
