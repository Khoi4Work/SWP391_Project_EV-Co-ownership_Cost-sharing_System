package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;

import java.util.List;

public interface IContractService {
    public Contract getContractByUser(int id);

    public ContractSigner setContract(ContractDecisionReq req);

    public void SendBulkEmail(SendEmailReq emailReq);

    public List<ContractSigner> createContract(ContractCreateReq req);
}
