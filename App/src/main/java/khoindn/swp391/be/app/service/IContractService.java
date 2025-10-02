package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ContractReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import org.apache.catalina.User;

import java.util.List;

public interface IContractService {
    public Contract getContract(int id);

    public ContractSigner setContract(ContractReq req, int idChoice);

    public void SendEmail(SendEmailReq emailReq);
}
