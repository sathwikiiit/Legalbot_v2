package com.legal.legalbot.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.legal.legalbot.model.Suit;
import com.legal.legalbot.repository.SuitRepos;
import com.legal.legalbot.services.SuitService;

    /**http://localhost:9090/: list of all suits | 
     * auth: Returns true if authenticated | 
     * insert: to post suit | 
     * user?name={}: List all suits of specific user | 
     * suit?id={}: return the suit
     * 
     */
    
@RestController
public class Controller {
    private final SuitRepos repo;
    private final SuitService suitService;

    @Autowired
    public Controller(SuitRepos repo, SuitService suitService) {
        this.repo = repo;
        this.suitService = suitService;
    }

    @GetMapping("/auth")
    public boolean auth(){
        return true;
    }

    @PostMapping("/insert")
    public boolean update(@RequestBody Suit suit){
        suit.setDate(new Date());
        suitService.saveSuit(suit);
        return true;
    } 

    @GetMapping("/user")
    public List<Suit> home(@RequestParam(required = true,name = "user") String name){
        return repo.findByUser(name);
    }

    @PostMapping("/generate")
    public ResponseEntity<Resource> generate(@RequestBody Suit suit) throws Exception {
        String fileName = "generated_doc_" + suit.getId() + ".docx";
        String filePath = System.getProperty("java.io.tmpdir") + File.separator + fileName;
        suitService.generateDoc(
            new ArrayList<>(List.of("Notice", "Summons", "Verification Affidavit", "Address Affidavit")),
            suit,
            filePath
        );
        FileSystemResource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Legalbot_Document.docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(resource);
    }
    @GetMapping("/suits")
    public List<Suit> getAllSuits() {
        return suitService.getAllSuits();
    }
    @GetMapping("/suitByPlaintiff")
    public Suit getSuitByPlaintiff(@RequestParam String plaintiff) {
        return suitService.getSuitByPlaintiff(plaintiff);
    }
    @PostMapping("/delete")
    public boolean deleteSuit(@RequestBody Suit suit) {
        suitService.deleteSuit(suit.getId());
        return true;
    }
    @PostMapping("/save")
    public boolean saveSuit(@RequestBody Suit suit) {
        suitService.saveSuit(suit);
        return true;
    }
    @GetMapping("/suitById")
    public Suit getSuitById(@RequestParam String id) {
        return suitService.getSuitById(id);
    }
}
