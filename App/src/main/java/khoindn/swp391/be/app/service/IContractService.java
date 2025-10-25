package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ContractCreateReq;
import khoindn.swp391.be.app.model.Request.ContractDecisionReq;
import khoindn.swp391.be.app.model.Response.ContractHistoryRes;
import khoindn.swp391.be.app.model.Response.ContractPendingRes;
import khoindn.swp391.be.app.pojo.Contract;
import khoindn.swp391.be.app.pojo.ContractSigner;
import khoindn.swp391.be.app.pojo.Users;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;

public interface IContractService {
    public Contract getContractByContractId(int id);

    public ContractSigner setContract(ContractDecisionReq req)
            throws
            InvalidKeySpecException,
            NoSuchAlgorithmException,
            SignatureException,
            InvalidKeyException;


    public List<ContractSigner> createContract(ContractCreateReq req);

    public List<ContractHistoryRes> getHistoryContractsByUser(Users user);

    public List<ContractSigner> getAllContractSignersByContractId(int id);

    public List<ContractSigner> getContractSignerByContractId(int id);

    public List<ContractPendingRes> getPendingContracts();

    public void SendWaitingConfirmedContract(int contractId);

}
