package com.legal.legalbot.dto.document;

import java.util.List;

public class SectionUpdateRequest {
    private String draftId;
    private String sectionKey;
    private List<RenderContextDto> renderContexts;

    public SectionUpdateRequest() {
    }

    public String getDraftId() {
        return draftId;
    }

    public void setDraftId(String draftId) {
        this.draftId = draftId;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public List<RenderContextDto> getRenderContexts() {
        return renderContexts;
    }

    public void setRenderContexts(List<RenderContextDto> renderContexts) {
        this.renderContexts = renderContexts;
    }
}
