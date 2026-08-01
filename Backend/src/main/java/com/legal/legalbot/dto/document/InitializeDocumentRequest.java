package com.legal.legalbot.dto.document;

import com.legal.legalbot.dto.SuitDto;

public class InitializeDocumentRequest {
    private String documentType;
    private SuitDto suitDto;
    private String draftId;

    public InitializeDocumentRequest() {
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public SuitDto getSuitDto() {
        return suitDto;
    }

    public void setSuitDto(SuitDto suitDto) {
        this.suitDto = suitDto;
    }

    public String getDraftId() {
        return draftId;
    }

    public void setDraftId(String draftId) {
        this.draftId = draftId;
    }
}
