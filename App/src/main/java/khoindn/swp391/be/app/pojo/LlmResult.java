package khoindn.swp391.be.app.pojo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LlmResult {
    private List<Choice> choices;
    private Usage usage;

    public String firstText() {
        if (choices != null && !choices.isEmpty()
                && choices.get(0).getMessage() != null) {
            return choices.get(0).getMessage().getContent();
        }
        return "";
    }

    public Integer getPromptTokens()     { return usage != null ? usage.getPrompt_tokens() : null; }
    public Integer getCompletionTokens() { return usage != null ? usage.getCompletion_tokens() : null; }
    public Integer getTotalTokens()      { return usage != null ? usage.getTotal_tokens() : null; }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {
        private Msg message;          // {"role":"assistant","content":"..."}
        private String finish_reason; // optional
        private Integer index;        // optional
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Msg {
        private String role;
        private String content;
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Usage {
        private Integer prompt_tokens;
        private Integer completion_tokens;
        private Integer total_tokens;
    }
}
