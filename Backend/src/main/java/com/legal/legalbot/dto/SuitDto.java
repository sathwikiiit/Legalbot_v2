package com.legal.legalbot.dto;

import java.util.Date;
import java.util.List;
import com.legal.legalbot.model.Suit;

public class SuitDto {
    private Long id;
    private String court;
    private String city;
    private String lawyer;
    private List<PartyDto> plaintiffs;
    private List<PartyDto> defendants;
    private List<PropertyDto> property;
    private Date date;
    private String suitType;
    private String relief;
    private String affiantIndex;

    // getters and setters...

    public static SuitDto fromEntity(Suit suit) {
        if (suit == null) return null;
        SuitDto dto = new SuitDto();
        dto.setId(suit.getId());
        dto.setCourt(suit.getCourt());
        dto.setCity(suit.getCity());
        dto.setLawyer(suit.getLawyer());
        dto.setPlaintiffs(PartyDto.fromEntityList(suit.getPlaintiffs()));
        dto.setDefendants(PartyDto.fromEntityList(suit.getDefendants()));
        dto.setProperty(PropertyDto.fromEntityList(suit.getProperty()));
        dto.setDate(suit.getDate());
        dto.setSuitType(suit.getSuitType());
        dto.setRelief(suit.getRelief());
        dto.setAffiantIndex(suit.getAffiantIndex());
        return dto;
    }

    public static Suit toEntity(SuitDto dto) {
        if (dto == null) return null;
        Suit suit = new Suit();
        suit.setId(dto.getId());
        suit.setCourt(dto.getCourt());
        suit.setCity(dto.getCity());
        suit.setLawyer(dto.getLawyer());
        suit.setPlaintiffs(PartyDto.toEntityList(dto.getPlaintiffs()));
        suit.setDefendants(PartyDto.toEntityList(dto.getDefendants()));
        suit.setProperty(PropertyDto.toEntityList(dto.getProperty()));
        suit.setDate(dto.getDate());
        suit.setSuitType(dto.getSuitType());
        suit.setRelief(dto.getRelief());
        suit.setAffiantIndex(dto.getAffiantIndex());
        return suit;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourt() {
        return court;
    }

    public void setCourt(String court) {
        this.court = court;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getLawyer() {
        return lawyer;
    }

    public void setLawyer(String lawyer) {
        this.lawyer = lawyer;
    }

    public List<PartyDto> getPlaintiffs() {
        return plaintiffs;
    }

    public void setPlaintiffs(List<PartyDto> plaintiffs) {
        this.plaintiffs = plaintiffs;
    }

    public List<PartyDto> getDefendants() {
        return defendants;
    }

    public void setDefendants(List<PartyDto> defendants) {
        this.defendants = defendants;
    }

    public List<PropertyDto> getProperty() {
        return property;
    }

    public void setProperty(List<PropertyDto> property) {
        this.property = property;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getSuitType() {
        return suitType;
    }

    public void setSuitType(String suitType) {
        this.suitType = suitType;
    }

    public String getRelief() {
        return relief;
    }

    public void setRelief(String relief) {
        this.relief = relief;
    }

    public String getAffiantIndex() {
        return affiantIndex;
    }

    public void setAffiantIndex(String affiantIndex) {
        this.affiantIndex = affiantIndex;
    }
}
