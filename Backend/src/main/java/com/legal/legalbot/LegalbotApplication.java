package com.legal.legalbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "@CrossOrigin(origins = "https://legalbot-v2.vercel.app")")
public class LegalbotApplication {

	public static void main(String[] args) {
		SpringApplication.run(LegalbotApplication.class, args);
	}

}
