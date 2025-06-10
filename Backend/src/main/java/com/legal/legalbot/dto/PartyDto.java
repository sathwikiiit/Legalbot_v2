package com.legal.legalbot.dto;

import java.util.List;
import java.util.stream.Collectors;
import com.legal.legalbot.model.Party;

public class PartyDto {
    private Long id;
    private String name;
    private String relation;
    private String gender;
    private int age;
    private String occupation;
    private String address;
    private String partyType;
    private int guardianIndex;

    // getters and setters...

    public static PartyDto fromEntity(Party party) {
        if (party == null) return null;
        PartyDto dto = new PartyDto();
        dto.setId(party.getId());
        dto.setName(party.getName());
        dto.setRelation(party.getRelation());
        dto.setGender(party.getGender());
        dto.setAge(party.getAge());
        dto.setOccupation(party.getOccupation());
        dto.setAddress(party.getAddress());
        dto.setPartyType(party.getPartyType());
        dto.setGuardianIndex(party.getGuardianIndex());
        return dto;
    }

    public static Party toEntity(PartyDto dto) {
        if (dto == null) return null;
        Party party = new Party();
        party.setId(dto.getId());
        party.setName(dto.getName());
        party.setRelation(dto.getRelation());
        party.setGender(dto.getGender());
        party.setAge(dto.getAge());
        party.setOccupation(dto.getOccupation());
        party.setAddress(dto.getAddress());
        party.setPartyType(dto.getPartyType());
        party.setGuardianIndex(dto.getGuardianIndex());
        return party;
    }

    public static List<PartyDto> fromEntityList(List<Party> parties) {
        return parties == null ? null : parties.stream().map(PartyDto::fromEntity).collect(Collectors.toList());
    }

    public static List<Party> toEntityList(List<PartyDto> dtos) {
        return dtos == null ? null : dtos.stream().map(PartyDto::toEntity).collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPartyType() {
        return partyType;
    }

    public void setPartyType(String partyType) {
        this.partyType = partyType;
    }

    public int getGuardianIndex() {
        return guardianIndex;
    }

    public void setGuardianIndex(int guardianIndex) {
        this.guardianIndex = guardianIndex;
    }
}
