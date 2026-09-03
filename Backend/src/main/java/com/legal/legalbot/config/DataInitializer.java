package com.legal.legalbot.config;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.legal.legalbot.dto.PartyDto;
import com.legal.legalbot.dto.PropertyDto;
import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.dto.document.RenderContextDto;
import com.legal.legalbot.services.SuitService;
import com.legal.legalbot.services.document.DocumentDraftService;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final SuitService suitService;
    private final DocumentDraftService draftService;

    public DataInitializer(SuitService suitService, DocumentDraftService draftService) {
        this.suitService = suitService;
        this.draftService = draftService;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) throws Exception {
        logger.info("Initializing Seed Data for Legalbot...");

        // 1. Seed Sample Suits if database is empty
        if (suitService.getAllSuits().isEmpty()) {
            // Suit 1: Money Recovery Suit
            SuitDto suit1 = new SuitDto();
            suit1.setCourt("IN THE COURT OF THE CIVIL JUDGE (SR DIVISION)");
            suit1.setCity("Bengaluru, Karnataka");
            suit1.setLawyer("Advocate");
            suit1.setSuitType("PLAINT_RECOVERY");
            suit1.setRelief("Decree for recovery of principal sum of Rs. 15,00,000/- along with interest @ 18% p.a. from date of suit till realization with costs.");
            suit1.setAffiantIndex("1");
            suit1.setDate(new Date());

            List<PartyDto> pfs1 = new ArrayList<>();
            PartyDto pf1 = new PartyDto();
            pf1.setName("Ramesh Kumar");
            pf1.setRelation("S/o Suresh Kumar");
            pf1.setGender("Male");
            pf1.setAge(42);
            pf1.setOccupation("Business");
            pf1.setAddress("Door No. 12, 4th Cross, Indiranagar, Bengaluru - 560038");
            pf1.setPartyType("PLAINTIFF");
            pfs1.add(pf1);
            suit1.setPlaintiffs(pfs1);

            List<PartyDto> dfs1 = new ArrayList<>();
            PartyDto df1 = new PartyDto();
            df1.setName("Vijay Verma");
            df1.setRelation("S/o Somnath Verma");
            df1.setGender("Male");
            df1.setAge(48);
            df1.setOccupation("Commercial Trader");
            df1.setAddress("Door No. 45, Commercial Street, Ward No. 80, Bengaluru - 560001");
            df1.setPartyType("DEFENDANT");
            dfs1.add(df1);
            suit1.setDefendants(dfs1);

            List<PropertyDto> props1 = new ArrayList<>();
            PropertyDto prop1 = new PropertyDto();
            prop1.setType("Commercial Premises / Shop");
            prop1.setMkvalue("50,00,000");
            prop1.setExtent("1,200 sq. ft.");
            prop1.setSyn("Sy. No. 112/A");
            prop1.setHn("Door No. 45");
            prop1.setPlotNo("Plot No. 88");
            props1.add(prop1);
            suit1.setProperty(props1);

            suitService.saveSuit(suit1);

            // Suit 2: Permanent Injunction & Corporate Suit
            SuitDto suit2 = new SuitDto();
            suit2.setCourt("IN THE COURT OF THE PRINCIPAL DISTRICT & SESSIONS JUDGE");
            suit2.setCity("Hyderabad, Telangana");
            suit2.setLawyer("Sathwik");
            suit2.setSuitType("PLAINT_INJUNCTION");
            suit2.setRelief("Permanent Injunction restraining defendants, their agents or representatives from interfering with peaceful possession of Schedule Property.");
            suit2.setAffiantIndex("1");
            suit2.setDate(new Date());

            List<PartyDto> pfs2 = new ArrayList<>();
            PartyDto pf2 = new PartyDto();
            pf2.setName("M/s Apex Enterprises Pvt Ltd");
            pf2.setRelation("Rep. by Managing Director Sri A. K. Rao");
            pf2.setGender("Male");
            pf2.setAge(50);
            pf2.setOccupation("Real Estate & Infrastructure");
            pf2.setAddress("Plot No. 102, HITEC City, Madhapur, Hyderabad - 500081");
            pf2.setPartyType("PLAINTIFF");
            pfs2.add(pf2);
            suit2.setPlaintiffs(pfs2);

            List<PartyDto> dfs2 = new ArrayList<>();
            PartyDto df2 = new PartyDto();
            df2.setName("Telangana Industrial Infrastructure Corporation");
            df2.setRelation("Rep. by Zonal Manager");
            df2.setGender("Male");
            df2.setAge(45);
            df2.setOccupation("Public Sector Undertaking");
            df2.setAddress("Parisrama Bhavan, Basheerbagh, Hyderabad - 500004");
            df2.setPartyType("DEFENDANT");
            dfs2.add(df2);
            suit2.setDefendants(dfs2);

            suitService.saveSuit(suit2);

            logger.info("Successfully seeded 2 sample suit records into database.");
        }

        // 2. Seed Default Sample Document Draft in DocumentDraftService
        String seedDraftId = "seed-draft-plaint-01";
        SuitDto firstSuit = suitService.getAllSuits().get(0);
        String draftId = draftService.createDraft("PLAINT_RECOVERY", firstSuit);

        // Pre-populate seed draft section contexts
        List<RenderContextDto> titleContext = List.of(
            new RenderContextDto("TITLE", "TITLE_HEADER", "Document Title", "IN THE COURT OF THE CIVIL JUDGE (SR DIVISION) AT BENGALURU", 0, "SEED", true)
        );
        List<RenderContextDto> partiesContext = List.of(
            new RenderContextDto("PARTIES", "PLAINTIFF_DESC", "Plaintiff", "Ramesh Kumar, S/o Suresh Kumar, Aged about 42 years, Residing at Door No. 12, 4th Cross, Indiranagar, Bengaluru - 560038 ... PLAINTIFF", 0, "SEED", true),
            new RenderContextDto("PARTIES", "DEFENDANT_DESC", "Defendant", "AND: Vijay Verma, S/o Somnath Verma, Aged about 48 years, Residing at Door No. 45, Commercial Street, Bengaluru - 560001 ... DEFENDANT", 1, "SEED", true)
        );
        List<RenderContextDto> factsContext = List.of(
            new RenderContextDto("FACTS", "FACT_1", "Fact 1", "1. That the Plaintiff and Defendant entered into a commercial agreement dated 10th March 2023 for supply of goods.", 0, "SEED", true),
            new RenderContextDto("FACTS", "FACT_2", "Fact 2", "2. That pursuant to the agreement, Plaintiff issued goods valued at Rs. 15,00,000/- against cheque No. 448201.", 1, "SEED", true),
            new RenderContextDto("FACTS", "FACT_3", "Fact 3", "3. That upon presentation, the said cheque was dishonoured due to insufficient funds, causing wrongful loss to Plaintiff.", 2, "SEED", true)
        );
        List<RenderContextDto> prayerContext = List.of(
            new RenderContextDto("PRAYER", "PRAYER_1", "Prayer Clause", "WHEREFORE, the Plaintiff prays for a decree of Rs. 15,00,000/- with interest @ 18% p.a. and costs of the suit.", 0, "SEED", true)
        );

        draftService.saveSectionContexts(draftId, "TITLE", titleContext);
        draftService.saveSectionContexts(draftId, "PARTIES", partiesContext);
        draftService.saveSectionContexts(draftId, "FACTS", factsContext);
        draftService.saveSectionContexts(draftId, "PRAYER", prayerContext);

        logger.info("Successfully created seed document draftId={}", draftId);
    }
}
