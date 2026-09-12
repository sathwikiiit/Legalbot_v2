package com.legal.legalbot.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.nio.charset.StandardCharsets;

import jakarta.servlet.FilterChain;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class HttpTraceLoggingFilterTest {

    private final HttpTraceLoggingFilter filter = new HttpTraceLoggingFilter();

    @Test
    void propagatesTraceIdAndPreservesRequestAndResponseBodies() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/suits");
        request.addHeader("X-Trace-Id", "trace-123");
        request.setContent("{\"title\":\"Example\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (requestInChain, responseInChain) -> {
            assertEquals("{\"title\":\"Example\"}",
                    new String(requestInChain.getInputStream().readAllBytes(), StandardCharsets.UTF_8));
            responseInChain.getWriter().write("{\"ok\":true}");
        };

        filter.doFilter(request, response, chain);

        assertEquals("trace-123", response.getHeader("X-Trace-Id"));
        assertEquals("{\"ok\":true}", response.getContentAsString());
        assertFalse(MDC.getCopyOfContextMap() != null && MDC.getCopyOfContextMap().containsKey("traceId"));
    }

    @Test
    void generatesTraceIdWhenRequestDoesNotProvideOne() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (requestInChain, responseInChain) -> {
        });

        String traceId = response.getHeader("X-Trace-Id");
        assertFalse(traceId == null || traceId.isBlank());
    }
}