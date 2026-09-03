package com.legal.legalbot.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.legal.legalbot.dto.ai.ChatRequest;
import com.legal.legalbot.services.ai.AIService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);
    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody ChatRequest request) {
        logger.info("Received AI chat request.");
        if (request == null || request.getPrompt() == null || request.getPrompt().isBlank()) {
            logger.warn("AI chat request missing prompt.");
            return ResponseEntity.badRequest().body("Prompt is required.");
        }

        String response = aiService.chat(request.getPrompt());
        logger.info("AI chat request completed.");
        return ResponseEntity.ok(response);
    }
}
