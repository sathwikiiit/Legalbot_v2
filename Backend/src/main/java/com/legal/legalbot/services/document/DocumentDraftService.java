package com.legal.legalbot.services.document;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.dto.document.RenderContextDto;

@Service
public class DocumentDraftService {

    private final Map<String, DocumentDraft> drafts = new ConcurrentHashMap<>();

    public String createDraft(String documentType, SuitDto suitDto) {
        String draftId = UUID.randomUUID().toString();
        DocumentDraft draft = new DocumentDraft(draftId, documentType, suitDto);
        drafts.put(draftId, draft);
        return draftId;
    }

    public Optional<DocumentDraft> getDraft(String draftId) {
        return Optional.ofNullable(drafts.get(draftId));
    }

    public void saveSectionContexts(String draftId, String sectionKey, List<RenderContextDto> contexts) {
        DocumentDraft draft = drafts.get(draftId);
        if (draft == null) {
            throw new IllegalArgumentException("Draft not found: " + draftId);
        }
        draft.setSectionContexts(sectionKey, contexts);
    }

    public Map<String, List<RenderContextDto>> getSectionContexts(String draftId) {
        DocumentDraft draft = drafts.get(draftId);
        if (draft == null) {
            throw new IllegalArgumentException("Draft not found: " + draftId);
        }
        return draft.getSectionContexts();
    }
}
