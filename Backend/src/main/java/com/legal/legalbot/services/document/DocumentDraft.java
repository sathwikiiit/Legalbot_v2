package com.legal.legalbot.services.document;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.dto.document.RenderContextDto;

public class DocumentDraft {

    private final String draftId;
    private final String documentType;
    private final SuitDto suitDto;
    private final Map<String, List<RenderContextDto>> sectionContexts = new HashMap<>();

    public DocumentDraft(String draftId, String documentType, SuitDto suitDto) {
        this.draftId = draftId;
        this.documentType = documentType;
        this.suitDto = suitDto;
    }

    public String getDraftId() {
        return draftId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public SuitDto getSuitDto() {
        return suitDto;
    }

    public Map<String, List<RenderContextDto>> getSectionContexts() {
        return sectionContexts;
    }

    public void setSectionContexts(String sectionKey, List<RenderContextDto> contexts) {
        this.sectionContexts.put(sectionKey, contexts);
    }
}
