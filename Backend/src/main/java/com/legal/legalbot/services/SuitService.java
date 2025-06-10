package com.legal.legalbot.services;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.legal.legalbot.dto.SuitDto;
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
    public void generateDoc(ArrayList<String> required_docs, SuitDto suitDto, String filePath) throws Exception{
        Suit suit = SuitDto.toEntity(suitDto);
        gen = new DocGen(suit);
        gen.generateDoc(required_docs, suit, filePath);
    }
    public void saveSuit(SuitDto suitDto) {
        Suit suit = SuitDto.toEntity(suitDto);
        suitRepos.save(suit);
    }
    public SuitDto getSuitById(Long id) {
        Suit suit = suitRepos.findById(id).orElse(null);
        return SuitDto.fromEntity(suit);
    }
    public ArrayList<SuitDto> getSuitsByLawyer(String lawyer) {
        List<Suit> suits = suitRepos.findByLawyer(lawyer);
        ArrayList<SuitDto> dtos = new ArrayList<>();
        for (Suit suit : suits) {
            dtos.add(SuitDto.fromEntity(suit));
        }
        return dtos;
    }
    public SuitDto getSuitByPlaintiff(String plaintiff) {
        Suit suit = suitRepos.findAll().stream()
            .filter(s -> s.getPlaintiff1().equals(plaintiff))
            .findFirst()
            .orElse(null);
        return SuitDto.fromEntity(suit);
    }
    public void deleteSuit(long id) {
        suitRepos.deleteById(id);
    }
    public ArrayList<SuitDto> getAllSuits() {
        List<Suit> suits = suitRepos.findAll();
        ArrayList<SuitDto> dtos = new ArrayList<>();
        for (Suit suit : suits) {
            dtos.add(SuitDto.fromEntity(suit));
        }
        return dtos;
    }
}