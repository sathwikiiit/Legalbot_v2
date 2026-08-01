package com.legal.legalbot.services.ai;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
public class RagReferenceService {

    private final String referenceText;

    public RagReferenceService(@Value("${ai.rag.examples-path:rag/facts-style-examples.txt}") String examplesPath) {
        this.referenceText = loadReferenceText(examplesPath);
    }

    private String loadReferenceText(String examplesPath) {
        try {
            Resource resource = new ClassPathResource(examplesPath);
            if (!resource.exists()) {
                return "";
            }
            try (InputStream is = resource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            return "";
        }
    }

    public String getReferenceText() {
        return referenceText;
    }
}
