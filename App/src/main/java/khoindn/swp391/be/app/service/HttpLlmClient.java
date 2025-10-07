// src/main/java/khoindn/swp391/be/app/service/HttpLlmClient.java
package khoindn.swp391.be.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import khoindn.swp391.be.app.pojo.LlmResult;
import khoindn.swp391.be.app.pojo.Message;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HttpLlmClient implements LlmClient {

    private final OkHttpClient client;
    private final ObjectMapper mapper;

    @Value("${openai.api.key}")  // thay vì llm.api-key
    private String apiKey;

    @Value("${llm.base-url:https://api.openai.com}")
    private String baseUrl;

    @Value("${llm.model:gpt-3.5-turbo}")
    private String model;

    public HttpLlmClient(ObjectMapper mapper) {
        this.mapper = mapper;
        this.client = new OkHttpClient.Builder()
                .callTimeout(Duration.ofSeconds(60))
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(60))
                .writeTimeout(Duration.ofSeconds(60))
                .build();
    }

    @Override
    public LlmResult chat(List<Message> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", messages.stream().map(Message::toMap).toList());
            body.put("temperature", 0.2);

            String json = mapper.writeValueAsString(body);

            Request request = new Request.Builder()
                    .url(baseUrl + "/v1/chat/completions")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(json, MediaType.parse("application/json")))
                    .build();

            try (Response resp = client.newCall(request).execute()) {
                if (!resp.isSuccessful()) {
                    throw new RuntimeException("LLM HTTP " + resp.code() + ": " + resp.message());
                }
                String respBody = resp.body() != null
                        ? new String(resp.body().bytes(), StandardCharsets.UTF_8) : "";
                return mapper.readValue(respBody, LlmResult.class);
            }
        } catch (Exception e) {
            throw new RuntimeException("LLM request failed: " + e.getMessage(), e);
        }
    }
}
