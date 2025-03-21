package com.legal.legalbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = {"https://legalbot-v2.vercel.app", "http://localhost:4200"})
public class LegalbotApplication {

	public static void main(String[] args) {
		SpringApplication.run(LegalbotApplication.class, args);
	}

}
