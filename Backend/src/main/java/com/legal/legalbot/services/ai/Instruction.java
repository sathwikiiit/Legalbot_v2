package com.legal.legalbot.services.ai;

public class Instruction {

    private final String name;
    private final String description;
    private final String template;

    private Instruction(String name, String description, String template) {
        this.name = name;
        this.description = description;
        this.template = template;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getTemplate() {
        return template;
    }

    public static Builder newBuilder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String description;
        private String template;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder template(String template) {
            this.template = template;
            return this;
        }

        public Instruction build() {
            return new Instruction(name, description, template);
        }
    }
}
