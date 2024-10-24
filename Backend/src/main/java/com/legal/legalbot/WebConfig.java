package com.legal.legalbot;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("*") // Allow for the specific "/auth" endpoint
            .allowedOrigins("127.0.0.1:4200") // Allow requests from your Angular app origin
            .allowedMethods("GET", "POST") // Allow specific HTTP methods (adjust as needed)
            .allowedHeaders("*"); // Allow all headers (adjust if necessary for security)
    }
}