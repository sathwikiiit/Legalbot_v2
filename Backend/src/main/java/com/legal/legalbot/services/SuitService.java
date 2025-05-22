package com.legal.legalbot.services;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.legal.legalbot.model.Suit;

@Service
public class SuitService {
    private DocGen gen;    
    public void generateDoc(ArrayList<String> required_docs, Suit suit) throws Exception{
        gen = new DocGen(suit);
        gen.generateDoc(required_docs, suit);
    }

}