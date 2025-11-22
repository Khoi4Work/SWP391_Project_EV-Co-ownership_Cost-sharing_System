package khoindn.swp391.be.app.model.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.thymeleaf.context.Context;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDetailReq {

    private String email;
    private  String name;
    private String subject;
    private String content;
    private String url;
    private String template;
    private Context context;
}
