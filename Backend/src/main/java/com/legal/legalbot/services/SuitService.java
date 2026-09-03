package com.legal.legalbot.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.repository.SuitRepos;
import com.legal.legalbot.services.docgen.legacy.DocGen;

@Service
@Transactional
public class SuitService {
    private DocGen gen;
    private final SuitRepos suitRepos;   
    
    public SuitService(SuitRepos suitRepos) {
        this.suitRepos = suitRepos;
    }

    public void generateDoc(ArrayList<String> required_docs, SuitDto suitDto, String filePath) throws Exception {
        Suit suit = SuitDto.toEntity(suitDto);
        gen = new DocGen(suit);
        gen.generateDoc(required_docs, suit, filePath);
    }

    public void saveSuit(SuitDto suitDto) {
        Suit suit = SuitDto.toEntity(suitDto);
        suitRepos.save(suit);
    }

    @Transactional(readOnly = true)
    public SuitDto getSuitById(Long id) {
        Suit suit = suitRepos.findById(id).orElse(null);
        return SuitDto.fromEntity(suit);
    }

    @Transactional(readOnly = true)
    public ArrayList<SuitDto> getSuitsByLawyer(String lawyer) {
        List<Suit> suits = suitRepos.findByLawyer(lawyer);
        ArrayList<SuitDto> dtos = new ArrayList<>();
        for (Suit suit : suits) {
            dtos.add(SuitDto.fromEntity(suit));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public SuitDto getSuitByPlaintiff(String plaintiff) {
        Suit suit = suitRepos.findAll().stream()
            .filter(s -> s.getPlaintiff1() != null && s.getPlaintiff1().equals(plaintiff))
            .findFirst()
            .orElse(null);
        return SuitDto.fromEntity(suit);
    }

    public void deleteSuit(long id) {
        suitRepos.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ArrayList<SuitDto> getAllSuits() {
        List<Suit> suits = suitRepos.findAll();
        ArrayList<SuitDto> dtos = new ArrayList<>();
        for (Suit suit : suits) {
            dtos.add(SuitDto.fromEntity(suit));
        }
        return dtos;
    }
}