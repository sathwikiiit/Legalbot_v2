package com.legal.legalbot;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AngController {

    @GetMapping(value = { "/login", "/dashboard", "/newsuit", "suit/{id}"}) // List the routes handled by Angular
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}