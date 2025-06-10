package com.legal.legalbot.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Party {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Unique identifier for the party

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    private String name;
    private String relation;
    private String gender;
    private int age;
    private String occupation;
    private String address;
    private String partyType; // "plaintiff" or "defendant"
    private int guardianIndex;

    @ManyToOne
    @JsonBackReference(value = "suit-plaintiffs")
    private Suit suit;

    // Default constructor
    public Party() {
        this.guardianIndex = 0; // Default value for guardianIndex
    }

    public Party(String name, String relation, String gender, int age, String occupation, String address, String partyType) {
        this.name = name;
        this.relation = relation;
        this.gender = gender;
        this.age = age;
        this.occupation = occupation;
        this.address = address;
        this.partyType = partyType;
        this.guardianIndex= 0;
    }
    public Party(String name, String relation, String gender, int age, String occupation, String address, String partyType, int guardianIndex) {
        this.name = name;
        this.relation = relation;
        this.gender = gender;
        this.age = age;
        this.occupation = occupation;
        this.address = address;
        this.partyType = partyType;
        this.guardianIndex= guardianIndex;
    }

    // Getters and setters
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

    public Suit getSuit() {
        return suit;
    }

    public void setSuit(Suit suit) {
        this.suit = suit;
    }

    @Override
    public String toString() {
        return name + " " + relation + ", Age: " + age + ", Occ: " + occupation + ", R/o " + address;
    }
    public int getGuardianIndex() {
        return guardianIndex;
    }
    public void setGuardianIndex(int guardianIndex) {
        this.guardianIndex = guardianIndex;
    }
        
}
