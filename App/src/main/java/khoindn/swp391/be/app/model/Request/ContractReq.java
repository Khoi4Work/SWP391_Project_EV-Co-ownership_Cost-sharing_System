package khoindn.swp391.be.app.model.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractReq {
    private int idChoice;
    private int idContract;
    private int idUserSigned;
}
