package khoindn.swp391.be.app.model.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.thymeleaf.context.Context;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendBulkEmailReq {
    private String content;
    private List<String> email;
    private  String name;
    private String subject;
    private List<String> url;
    private String template;
    private Context context;
}
