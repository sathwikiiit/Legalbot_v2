package com.legal.legalbot.dto.ai;

import java.util.List;

public record FactsResponse(
        List<String> facts
) {}
