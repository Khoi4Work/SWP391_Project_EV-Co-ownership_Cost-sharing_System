package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.ChatRequest;
import khoindn.swp391.be.app.model.Response.ChatResponse;
import khoindn.swp391.be.app.pojo.LlmResult;
import khoindn.swp391.be.app.pojo.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatGPTService {

    private static final Logger log = LoggerFactory.getLogger(ChatGPTService.class);

    private final LlmClient llmClient;
    private final KnowledgeSearchService knowledgeSearchService;

    public ChatGPTService(LlmClient llmClient, KnowledgeSearchService knowledgeSearchService) {
        this.llmClient = llmClient;
        this.knowledgeSearchService = knowledgeSearchService;
    }

    public ChatResponse generateReply(ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            return ChatResponse.builder()
                    .reply("Hi! Please provide a message.")
                    .createdAt(OffsetDateTime.now())
                    .build();
        }

        final int TOP_K = 5;
        List<String> dbContexts = safeList(knowledgeSearchService.searchRelated(request.getMessage(), TOP_K));
        List<String> clientCtx  = safeList(request.getContext());

        // Gộp, loại trùng (giữ thứ tự), cắt gọn “theo từ” để hạn chế token
        List<String> allContexts = new ArrayList<>(dedupeKeepOrder(dbContexts));
        allContexts.addAll(dedupeKeepOrder(clientCtx));

        String contextBlock = buildContextBlockWordLimited(allContexts, /*maxWords*/ 180); // ~1200–1400 chars

        // Nếu không có context nội bộ, nói rõ để giảm bịa
        boolean hasInternal = !dbContexts.isEmpty();
        if (!hasInternal) {
            contextBlock = "(no internal context found)";
        }

        // Messages
        List<Message> messages = new ArrayList<>();
        messages.add(Message.system(
                "You are an assistant for an EV Co-ownership system.\n" +
                        "- Use ONLY the provided CONTEXT. If the information is missing in CONTEXT, say you are not sure and suggest what data is needed.\n" +
                        "- Be concise and factual. If you reference a specific fact, cite the Source #.\n" +
                        "- Do NOT fabricate IDs, dates, or policies that are not explicitly in CONTEXT.\n" +
                        "- If no internal context is provided, answer generally but clearly state that internal data was not found."
        ));

        String userPayload = """
                === CONTEXT START ===
                %s
                === CONTEXT END ===

                USER QUESTION:
                %s
                """.formatted(contextBlock, request.getMessage());
        messages.add(Message.user(userPayload));

        // Gọi model an toàn
        String reply;
        Integer promptT = null, completionT = null, totalT = null;
        try {
            LlmResult result = llmClient.chat(messages);
            reply    = (result != null && result.firstText() != null)
                    ? result.firstText()
                    : (hasInternal
                    ? "Sorry, I couldn't synthesize an answer from the current context."
                    : "I don't see any internal data for this question. Could you provide more details?");
            if (result != null) {
                promptT = result.getPromptTokens();
                completionT = result.getCompletionTokens();
                totalT = result.getTotalTokens();
            }
        } catch (Exception e) {
            log.error("LLM call failed", e);
            reply = hasInternal
                    ? "The assistant encountered an error while generating a response from the context. Please try again."
                    : "The assistant couldn't access internal data at the moment. Please try again later.";
        }

        // Log căn bản để debug chất lượng
        log.info("Q='{}' | ctx_db={} | ctx_client={} | ctx_words~={}",
                trimLog(request.getMessage(), 160),
                dbContexts.size(), clientCtx.size(),
                approxWordCount(contextBlock));

        return ChatResponse.builder()
                .reply(reply)
                .createdAt(OffsetDateTime.now())
                .promptTokens(promptT)
                .completionTokens(completionT)
                .totalTokens(totalT)
                .build();
    }

    // -------- Helpers --------

    private List<String> safeList(List<String> in) {
        return (in == null) ? Collections.emptyList() : in.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    private List<String> dedupeKeepOrder(List<String> items) {
        LinkedHashSet<String> set = new LinkedHashSet<>(items);
        return new ArrayList<>(set);
    }

    private String buildContextBlockWordLimited(List<String> contexts, int maxWords) {
        if (contexts == null || contexts.isEmpty()) return "(no internal context found)";
        StringBuilder sb = new StringBuilder();
        int idx = 1, words = 0;
        for (String c : contexts) {
            String line = ("Source #" + idx + ": " + c.trim()).replaceAll("\\s+", " ");
            int w = wordCount(line);
            if (words + w > maxWords) break;
            sb.append(line).append("\n");
            words += w;
            idx++;
        }
        String out = sb.toString().trim();
        return out.isBlank() ? "(no internal context found)" : out;
    }

    private int wordCount(String s) { return (int) Arrays.stream(s.split("\\s+")).filter(t -> !t.isBlank()).count(); }
    private int approxWordCount(String s) { return (s == null) ? 0 : wordCount(s); }
    private String trimLog(String s, int max) { return (s.length() <= max) ? s : s.substring(0, max) + "..."; }
}
