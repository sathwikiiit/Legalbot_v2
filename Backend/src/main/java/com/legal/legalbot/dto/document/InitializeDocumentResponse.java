package com.legal.legalbot.dto.document;

import java.util.List;
import java.util.Map;

public class InitializeDocumentResponse {
    private String draftId;
    private DocumentTemplateDto template;
    private Map<String, List<RenderContextDto>> initialSectionContexts;

    public InitializeDocumentResponse() {
    }

    public String getDraftId() {
        return draftId;
    }

    public void setDraftId(String draftId) {
        this.draftId = draftId;
    }

    public DocumentTemplateDto getTemplate() {
        return template;
    }

    public void setTemplate(DocumentTemplateDto template) {
        this.template = template;
    }

    public Map<String, List<RenderContextDto>> getInitialSectionContexts() {
        return initialSectionContexts;
    }

    public void setInitialSectionContexts(Map<String, List<RenderContextDto>> initialSectionContexts) {
        this.initialSectionContexts = initialSectionContexts;
    }
}
