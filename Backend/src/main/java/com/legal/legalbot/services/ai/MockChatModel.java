package com.legal.legalbot.services.ai;

public class MockChatModel implements ChatModel {

    @Override
    public String generate(String prompt) {
        if (prompt == null) return "{}";

        boolean isInteractive = prompt.contains("Interactive Guidelines");
        boolean hasHistory = prompt.contains("Conversation History:");

        if (prompt.toLowerCase().contains("facts")) {
            if (isInteractive && !hasHistory) {
                return "{\"status\": \"NEEDS_INFO\", \"question\": \"What date did the alleged encroachment take place?\"}";
            }
            return "{\"status\": \"COMPLETE\", \"data\": {\"facts\": [\"Plaintiff is the absolute owner of the suit property.\", \"Defendant unlawfully encroached on the suit property in January 2024.\"]}}";
        } else if (prompt.toLowerCase().contains("relief")) {
            if (isInteractive && !hasHistory) {
                return "{\"status\": \"NEEDS_INFO\", \"question\": \"Are you seeking a permanent or temporary injunction?\"}";
            }
            return "{\"status\": \"COMPLETE\", \"data\": {\"reliefs\": [\"Directing the defendant to hand over vacant possession of the suit property to the plaintiff.\", \"Granting a permanent injunction against the defendant.\"]}}";
        }

        return "{}";
    }
}
