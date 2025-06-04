package com.legal.legalbot.services;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.legal.legalbot.model.Suit;
import com.legal.legalbot.repository.SuitRepos;

@Service
public class SuitService {
    private DocGen gen;
    private SuitRepos suitRepos;   
    
    @Autowired
    public SuitService(SuitRepos suitRepos) {
        this.suitRepos = suitRepos;
    }
    public void generateDoc(ArrayList<String> required_docs, Suit suit, String filePath) throws Exception{
        gen = new DocGen(suit);
        gen.generateDoc(required_docs, suit, filePath);
    }
    public void saveSuit(Suit suit) {
        suitRepos.save(suit);
    }
    public Suit getSuitById(String id) {
        return suitRepos.findById(id).orElse(null);
    }
    public ArrayList<Suit> getSuitsByUser(String user) {
        return (ArrayList<Suit>) suitRepos.findByUser(user);
    }
    public Suit getSuitByPlaintiff(String plaintiff) {
        return suitRepos.findAll().stream()
            .filter(suit -> suit.getPlaintiff1().equals(plaintiff))
            .findFirst()
            .orElse(null);
    }
    public void deleteSuit(long id) {
        suitRepos.deleteById(id);
    }
    public ArrayList<Suit> getAllSuits() {
        return (ArrayList<Suit>) suitRepos.findAll();
    }
}