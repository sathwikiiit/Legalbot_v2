package com.legal.legalbot.dto;

import java.util.List;

public class GenerateRequest {
    private SuitDto suitDto;
    private List<String> documents; // or List<Boolean> if you want booleans

    public SuitDto getSuitDto() {
        return suitDto;
    }
    public void setSuitDto(SuitDto suitDto) {
        this.suitDto = suitDto;
    }
    public List<String> getDocuments() {
        return documents;
    }
    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }
}
