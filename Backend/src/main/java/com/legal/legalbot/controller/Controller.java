package com.legal.legalbot.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.legal.legalbot.dto.GenerateRequest;
import com.legal.legalbot.dto.SuitDto;
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
    private static final Logger logger = LoggerFactory.getLogger(Controller.class);
    private final SuitService suitService;

    public Controller(SuitService suitService) {
        this.suitService = suitService;
    }

    @GetMapping("/auth")
    public boolean auth(){
        return true;
    }

    @PostMapping("/insert")
    public boolean update(@RequestBody SuitDto suitDto){
        suitDto.setDate(new Date());
        suitService.saveSuit(suitDto);
        return true;
    } 

    @GetMapping("/user")
    public List<SuitDto> home(@RequestParam(required = true,name = "lawyer") String name){
        return suitService.getSuitsByLawyer(name);
    }

    @PostMapping("/generate")
    public ResponseEntity<Resource> generate(@RequestBody GenerateRequest request) throws Exception {
        String fileName = "generated_doc_" + request.getSuitDto().getId() + ".docx";
        String filePath = System.getProperty("java.io.tmpdir") + File.separator + fileName;
        suitService.generateDoc(
            new ArrayList<>(request.getDocuments()),
            request.getSuitDto(),
            filePath
        );
        FileSystemResource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Legalbot_Document.docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(resource);
    }
    @GetMapping("/suits")
    public List<SuitDto> getAllSuits() {
        return suitService.getAllSuits();
    }
    @GetMapping("/suitByPlaintiff")
    public SuitDto getSuitByPlaintiff(@RequestParam String plaintiff) {
        return suitService.getSuitByPlaintiff(plaintiff);
    }
    @PostMapping(value = "/delete", consumes = MediaType.APPLICATION_JSON_VALUE)
    public boolean deleteSuit(@RequestBody SuitDto suitDto) {
        suitService.deleteSuit(suitDto.getId());
        return true;
    }
    @PostMapping("/save")
    public boolean saveSuit(@RequestBody SuitDto suitDto) {
        logger.info("Saving suit for lawyer={}", suitDto.getLawyer());
        try{
            suitDto.setDate(new Date());
            suitService.saveSuit(suitDto);
            logger.info("Suit saved successfully for lawyer={}", suitDto.getLawyer());
            return true;
        } catch (Exception e) {
            logger.error("Error saving suit", e);
            return false;
        }
    }
    @GetMapping("/suitById")
    public SuitDto getSuitById(@RequestParam Long id) {
        return suitService.getSuitById(id);
    }
}
