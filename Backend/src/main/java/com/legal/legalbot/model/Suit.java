package com.legal.legalbot.model;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;

@Entity
public class Suit {
    @Id
    @Column(name="id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;

    @Column(name = "Court")
    protected String court;

    @Column(name = "City")
    protected String city;

    @Column(name = "created_by")
    protected String user;

    @Column(name="Plaintiffs")
    protected Party[] plaintiffs;

    @Column(name="Defendants")
    protected Party[] defendants;

    @Column(name = "Date")
    protected Date date;

    public Date getDate() {
        return date;
    }


    public void setDate(Date date) {
        this.date = date;
    }


    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "suit_id")
    private List<Property> property;

    private String suitType;

    private String relief;

    private String affiantIndex;

    public String details(){
        return getPlaintiff1()+" vs "+getDefendant1();
    }


    public long getId() {
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


    public String getUser() {
        return user;
    }


    public void setUser(String user) {
        this.user = user;
    }


    public Party[] getPlaintiffs() {
        return plaintiffs;
    }


    public void setPlaintiffs(Party[] plaintiffs) {
        this.plaintiffs = plaintiffs;
    }


    public Party[] getDefendants() {
        return defendants;
    }


    public void setDefendants(Party[] defendants) {
        this.defendants = defendants;
    }


    public String getPlaintiff1() {
        return this.plaintiffs[0].getName();
    }

    public String getDefendant1() {
        return this.defendants[0].getName();
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

        for (int i = 0; i < plaintiffs.length; i++) {
            Party plaintiff = plaintiffs[i];
            int guardianIdx = plaintiff.getGuardianIndex();
            if (guardianIdx >= 0 && guardianIdx < plaintiffs.length) {
                Party guardian = plaintiffs[guardianIdx];
                guardianMap.computeIfAbsent(guardian, __ -> new HashSet<>()).add(plaintiff);
            }
        }

        return guardianMap;
    }


        public void setId(long id) {
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
