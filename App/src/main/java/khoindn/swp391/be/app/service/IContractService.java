package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Request.SendEmailReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.pojo.Users;

import java.util.List;

public interface IContractService {
    public Contract getContractByContractId(int id);

    public ContractSigner setContract(ContractDecisionReq req);


    public List<ContractSigner> createContract(ContractCreateReq req);

    public List<ContractHistoryRes> getHistoryContractsByUser(Users user);


    public List<ContractSigner> getContractSignerByContractId(int id);
}
