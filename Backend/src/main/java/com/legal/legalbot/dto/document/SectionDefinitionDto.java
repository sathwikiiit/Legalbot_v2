package com.legal.legalbot.dto.document;

public class SectionDefinitionDto {
    private String sectionKey;
    private String title;
    private String sourceType;
    private boolean editable;
    private String taskKey;
    private int sequence;

    public SectionDefinitionDto() {
    }

    public SectionDefinitionDto(String sectionKey, String title, String sourceType, boolean editable, String taskKey, int sequence) {
        this.sectionKey = sectionKey;
        this.title = title;
        this.sourceType = sourceType;
        this.editable = editable;
        this.taskKey = taskKey;
        this.sequence = sequence;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getTaskKey() {
        return taskKey;
    }

    public void setTaskKey(String taskKey) {
        this.taskKey = taskKey;
    }

    public int getSequence() {
        return sequence;
    }

    public void setSequence(int sequence) {
        this.sequence = sequence;
    }
}
