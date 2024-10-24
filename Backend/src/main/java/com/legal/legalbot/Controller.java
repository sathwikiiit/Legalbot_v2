package com.legal.legalbot;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

    /**http://localhost:9090/: list of all suits | 
     * auth: Returns true if authenticated | 
     * insert: to post suit | 
     * user?name={}: List all suits of specific user | 
     * suit?id={}: return the suit
     * 
     */
    
@RestController
public class Controller {
    @Autowired
    private Repos repo;

    @GetMapping("/")
    public List<Suit> suits(){
        return repo.findAll();
    }

    @GetMapping("/auth")
    public boolean auth(){
        return true;
    }

    @PostMapping("/insert")
    public boolean update(@RequestBody Suit suit){
        suit.setDate(new Date());
        repo.save(suit);
        return true;
    } 

    @GetMapping("/user")
    public List<Suit> home(@RequestParam(required = true,name = "user") String name){
        return repo.findByUser(name);
    }

    @GetMapping("/suit")
    public Optional<Suit> user(@RequestParam(name="id", required = true) Long id){
        return repo.findById(id);
    }
}
