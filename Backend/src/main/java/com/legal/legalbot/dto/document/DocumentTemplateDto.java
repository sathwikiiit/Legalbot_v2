package com.legal.legalbot.dto.document;

import java.util.List;

public class DocumentTemplateDto {
    private String templateKey;
    private String displayName;
    private List<SectionDefinitionDto> sections;

    public DocumentTemplateDto() {
    }

    public DocumentTemplateDto(String templateKey, String displayName, List<SectionDefinitionDto> sections) {
        this.templateKey = templateKey;
        this.displayName = displayName;
        this.sections = sections;
    }

    public String getTemplateKey() {
        return templateKey;
    }

    public void setTemplateKey(String templateKey) {
        this.templateKey = templateKey;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<SectionDefinitionDto> getSections() {
        return sections;
    }

    public void setSections(List<SectionDefinitionDto> sections) {
        this.sections = sections;
    }
}
