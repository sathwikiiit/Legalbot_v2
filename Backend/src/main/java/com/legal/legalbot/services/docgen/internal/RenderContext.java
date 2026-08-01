package com.legal.legalbot.services.docgen.internal;

public class RenderContext {
    private final String definitionKey;
    private final String context;
    private final String value;

    public RenderContext(String definitionKey, String context, String value) {
        this.definitionKey = definitionKey;
        this.context = context;
        this.value = value;
    }

    public RenderContext(String definitionKey, String context) {
        this(definitionKey, context, context);
    }

    public String getDefinitionKey() {
        return definitionKey;
    }

    public String getContext() {
        return context;
    }

    public String getValue() {
        return value;
    }
}
