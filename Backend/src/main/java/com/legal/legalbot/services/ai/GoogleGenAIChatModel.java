package com.legal.legalbot.services.ai;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GoogleGenAIChatModel implements ChatModel {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GoogleGenAIChatModel(
            @Value("${spring.ai.google.genai.api-key:}") String apiKey,
            @Value("${spring.ai.google.genai.chat.options.model:gemini-2.5-flash}") String model
    ) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public String generate(String prompt) {
        if (this.apiKey == null || this.apiKey.isBlank()) {
            throw new IllegalStateException("Google AI API key is not configured.");
        }

        String url = String.format("https://generativelanguage.googleapis.com/v1beta2/models/%s:generate", model);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> promptMap = new HashMap<>();
        promptMap.put("text", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("prompt", promptMap);
        body.put("temperature", 0.2);
        body.put("maxOutputTokens", 1024);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        String response = restTemplate.postForObject(url, request, String.class);

        if (response == null || response.isBlank()) {
            throw new IllegalStateException("Empty response from Google GenAI.");
        }

        return extractTextResponse(response);
    }

    private String extractTextResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode candidate = candidates.get(0);
                JsonNode content = candidate.path("content");
                if (content.isTextual()) {
                    return content.asText();
                }
                if (content.isArray() && content.size() > 0) {
                    StringBuilder combined = new StringBuilder();
                    for (JsonNode element : content) {
                        if (element.has("text")) {
                            combined.append(element.get("text").asText());
                        } else if (element.isTextual()) {
                            combined.append(element.asText());
                        }
                    }
                    return combined.toString();
                }
                if (candidate.has("text")) {
                    return candidate.get("text").asText();
                }
            }

            if (root.has("output")) {
                JsonNode output = root.get("output");
                if (output.has("text")) {
                    return output.get("text").asText();
                }
            }

            return rawResponse;
        } catch (Exception e) {
            return rawResponse;
        }
    }
}
