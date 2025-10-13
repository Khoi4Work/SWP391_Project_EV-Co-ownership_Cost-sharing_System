package khoindn.swp391.be.app.service;

import java.util.List;
import khoindn.swp391.be.app.pojo.Message;
import khoindn.swp391.be.app.pojo.LlmResult;

public interface LlmClient {
    LlmResult chat(List<Message> messages);
}
