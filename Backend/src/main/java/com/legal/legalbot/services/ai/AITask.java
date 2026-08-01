package com.legal.legalbot.services.ai;

public record AITask<T>(
        Prompt prompt,
        Class<T> responseType,
        boolean interactive
) {}
