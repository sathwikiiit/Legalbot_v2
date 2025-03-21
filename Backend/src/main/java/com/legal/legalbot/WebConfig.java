package com.legal.legalbot;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("*") // Allow for the specific "/auth" endpoint
            .allowedOrigins("http://localhost:4200", "https://legalbot-v2.vercel.app") // Corrected origins
            .allowedMethods("GET", "POST","OPTIONS") // Allow specific HTTP methods (adjust as needed)
            .allowedHeaders("*"); // Allow all headers (adjust if necessary for security)
    }
}