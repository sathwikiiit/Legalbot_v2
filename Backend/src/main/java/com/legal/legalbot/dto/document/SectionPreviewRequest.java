package com.legal.legalbot.dto.document;

import com.legal.legalbot.dto.SuitDto;

public class SectionPreviewRequest {
    private String draftId;
    private String documentType;
    private String sectionKey;
    private SuitDto suitDto;
    private String conversationHistory;

    public SectionPreviewRequest() {
    }

    public String getDraftId() {
        return draftId;
    }

    public void setDraftId(String draftId) {
        this.draftId = draftId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public SuitDto getSuitDto() {
        return suitDto;
    }

    public void setSuitDto(SuitDto suitDto) {
        this.suitDto = suitDto;
    }

    public String getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(String conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}
