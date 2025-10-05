package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ChatRequest;
import khoindn.swp391.be.app.model.Response.ChatResponse;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

/**
 * Stub service for generating chat replies.
 * Replace the body with real LLM call (OpenAI, local model, etc.).
 */
@Service
public class ChatGPTService {

    public ChatResponse generateReply(ChatRequest request) {
        // ===== Replace this block with real provider integration =====
        String userMsg = request != null ? request.getMessage() : "";
        String reply = (userMsg == null || userMsg.isBlank())
                ? "Hi! Please provide a message."
                : "Echo: " + userMsg;
        // ============================================================

        return ChatResponse.builder()
                .reply(reply)
                .createdAt(OffsetDateTime.now())
                .promptTokens(null)
                .completionTokens(null)
                .totalTokens(null)
                .build();
    }
}
