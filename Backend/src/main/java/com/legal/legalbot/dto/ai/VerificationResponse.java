package com.legal.legalbot.dto.ai;

public record VerificationResponse(
        String verificationStatement,
        String location,
        String date
) {}
