package com.legal.legalbot.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HttpTraceLoggingFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpTraceLoggingFilter.class);
    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private static final String TRACE_ID_MDC_KEY = "traceId";
    private static final int MAX_BODY_LENGTH = 10_000;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        long startedAt = System.nanoTime();
        MDC.put(TRACE_ID_MDC_KEY, traceId);
        responseWrapper.setHeader(TRACE_ID_HEADER, traceId);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } catch (Exception exception) {
            LOGGER.error("HTTP request failed traceId={} method={} uri={} requestBody={}",
                    traceId, request.getMethod(), request.getRequestURI(), requestBody(requestWrapper), exception);
            throw exception;
        } finally {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            LOGGER.info("HTTP request traceId={} method={} uri={} status={} durationMs={} requestBody={} responseBody={}",
                    traceId,
                    request.getMethod(),
                    request.getRequestURI(),
                    responseWrapper.getStatus(),
                    durationMs,
                    requestBody(requestWrapper),
                    responseBody(responseWrapper));
            responseWrapper.copyBodyToResponse();
            MDC.remove(TRACE_ID_MDC_KEY);
        }
    }

    private String requestBody(ContentCachingRequestWrapper request) throws IOException {
        if (request.getContentAsByteArray().length == 0 && request.getContentLengthLong() > 0) {
            StreamUtils.copyToByteArray(request.getInputStream());
        }
        return bodyAsString(request.getContentAsByteArray());
    }

    private String responseBody(ContentCachingResponseWrapper response) {
        return bodyAsString(response.getContentAsByteArray());
    }

    private String bodyAsString(byte[] body) {
        String value = new String(body, StandardCharsets.UTF_8).replaceAll("\\s+", " ").trim();
        if (value.length() > MAX_BODY_LENGTH) {
            return value.substring(0, MAX_BODY_LENGTH) + "...";
        }
        return value;
    }
}