package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ChatRequest;
import khoindn.swp391.be.app.model.Response.ChatResponse;
import khoindn.swp391.be.app.pojo.Message;
import khoindn.swp391.be.app.pojo.LlmResult;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatGPTService {

    private final LlmClient llmClient;

    // Inject LlmClient (HttpLlmClient sẽ tự động được dùng)
    public ChatGPTService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    public ChatResponse generateReply(ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            return ChatResponse.builder()
                    .reply("Hi! Please provide a message.")
                    .createdAt(OffsetDateTime.now())
                    .build();
        }

        // 1️⃣ Tạo danh sách message gửi lên model
        List<Message> messages = new ArrayList<>();
        messages.add(Message.system("You are a helpful assistant for an EV Co-ownership system."));
        if (request.getContext() != null) {
            for (String c : request.getContext()) {
                messages.add(Message.user(c));
            }
        }
        messages.add(Message.user(request.getMessage()));

        // 2️⃣ Gọi model qua HttpLlmClient
        LlmResult result = llmClient.chat(messages);

        // 3️⃣ Lấy kết quả
        String reply = result != null ? result.firstText() : "No response from model.";

        // 4️⃣ Trả về cho controller
        return ChatResponse.builder()
                .reply(reply)
                .createdAt(OffsetDateTime.now())
                .promptTokens(result != null ? result.getPromptTokens() : null)
                .completionTokens(result != null ? result.getCompletionTokens() : null)
                .totalTokens(result != null ? result.getTotalTokens() : null)
                .build();
    }
}
