package khoindn.swp391.be.app.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import khoindn.swp391.be.app.service.ChatGPTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@SecurityRequirement(name = "api")
public class ChatController {

    @Autowired
    private ChatGPTService chatGPTService;

    @PostMapping
    public String chat(@RequestBody String prompt) throws Exception {
        return chatGPTService.askChatGPT(prompt);
    }
}
