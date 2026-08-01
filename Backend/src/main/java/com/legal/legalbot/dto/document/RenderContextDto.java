package com.legal.legalbot.dto.document;

public class RenderContextDto {
    private String sectionKey;
    private String definitionKey;
    private String context;
    private String value;
    private int order;
    private String sourceType;
    private boolean editable;

    public RenderContextDto() {
    }

    public RenderContextDto(String sectionKey, String definitionKey, String context, String value, int order, String sourceType, boolean editable) {
        this.sectionKey = sectionKey;
        this.definitionKey = definitionKey;
        this.context = context;
        this.value = value;
        this.order = order;
        this.sourceType = sourceType;
        this.editable = editable;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getDefinitionKey() {
        return definitionKey;
    }

    public void setDefinitionKey(String definitionKey) {
        this.definitionKey = definitionKey;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public boolean isEditable() {
        return editable;
    }

    public void setEditable(boolean editable) {
        this.editable = editable;
    }
}
