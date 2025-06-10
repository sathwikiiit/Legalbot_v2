package com.legal.legalbot.model;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;

@Entity
public class Suit {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String court;
    private String city;
    private String lawyer;
    @JoinColumn(name = "suit_id")
    @OneToMany(cascade = CascadeType.ALL)
    @JsonManagedReference(value = "suit-plaintiffs")
    private List<Party> plaintiffs;
    @JoinColumn(name = "suit_id")
    @OneToMany(cascade = CascadeType.ALL)
    @JsonManagedReference(value = "suit-defendants")
    private List<Party> defendants;
    private Date date;
    public Suit() {
        // Default constructor
    }

    public Date getDate() {
        return date;
    }


    public void setDate(Date date) {
        this.date = date;
    }


    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "suit_id")
    @JsonManagedReference(value = "suit-property")
    private List<Property> property;

    private String suitType;

    private String relief;

    private String affiantIndex;

    public String details(){
        return getPlaintiff1()+" vs "+getDefendant1();
    }


    public Long getId() {
        return id;
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


    public List<Party> getPlaintiffs() {
        return plaintiffs;
    }


    public void setPlaintiffs(List<Party> plaintiffs) {
        this.plaintiffs = plaintiffs;
    }


    public List<Party> getDefendants() {
        return defendants;
    }


    public void setDefendants(List<Party> defendants) {
        this.defendants = defendants;
    }


    public String getPlaintiff1() {
        return this.plaintiffs.get(0).getName();
    }

    public String getDefendant1() {
        return this.defendants.get(0).getName();
    }

    public List<Property> getProperty() {
        return property;
    }


    public void setProperty(List<Property> property) {
        this.property = property;
    }

    public Map<String, Object> toSuitMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("pfs", plaintiffs);
        map.put("dfs", defendants);
        map.put("court", court);
        map.put("city", city);
        map.put("suit_type", suitType);
        map.put("relief", relief);
        map.put("affiant_index",affiantIndex);
        return map;
    }
        /**
     * Returns a map from each guardian Party to the set of plaintiffs they are guarding.
     */
    public Map<Party, Set<Party>> getGuardiansToPlaintiffsMap() {
        Map<Party, Set<Party>> guardianMap = new HashMap<>();

        if (plaintiffs == null) {
            return guardianMap;
        }

        for (int i = 0; i < plaintiffs.size(); i++) {
            Party plaintiff = plaintiffs.get(i);
            int guardianIdx = plaintiff.getGuardianIndex();
            if (guardianIdx >= 0 && guardianIdx < plaintiffs.size()) {
                Party guardian = plaintiffs.get(guardianIdx);
                guardianMap.computeIfAbsent(guardian, __ -> new HashSet<>()).add(plaintiff);
            }
        }

        return guardianMap;
    }


        public void setId(Long id) {
            this.id = id;
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
