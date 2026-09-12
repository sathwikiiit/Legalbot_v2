package com.legal.legalbot.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String type; // Property type (e.g., land, plot, house)

    private String mkvalue; // Property mkvalue

    private String extent; // Property extent (e.g., area, size)
    private String syn; // Survey Number (if applicable)

    private String hn; // House number

    private String plotNo; // Plot number

    private BigDecimal areaValue;
    private String areaUnit;
    private BigDecimal guntas;

    private String flatNo;
    private String buildingName;
    private String street;
    private String locality;
    private String villageOrTown;
    private String mandal;
    private String district;
    private String state;
    private String pincode;

    private String northBoundary;
    private String southBoundary;
    private String eastBoundary;
    private String westBoundary;

    @ManyToOne
    @JsonBackReference(value = "suit-property")
    private Suit suit;

    private String context;

    public Property() {
        // Default constructor
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }



    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getmkvalue() {
        return mkvalue;
    }

    public void setmkvalue(String mkvalue) {
        this.mkvalue = mkvalue;
    }

    public String getExtent() {
        return extent;
    }

    public void setExtent(String extent) {
        this.extent = extent;
    }

    public String getSyn() {
        return syn;
    }

    public void setSyn(String syn) {
        this.syn = syn;
    }

    public String getHn() {
        return hn;
    }

    public void setHn(String hn) {
        this.hn = hn;
    }

    public String getPlotNo() {
        return plotNo;
    }

    public void setPlotNo(String plotNo) {
        this.plotNo = plotNo;
    }

    public BigDecimal getAreaValue() {
        return areaValue;
    }

    public void setAreaValue(BigDecimal areaValue) {
        this.areaValue = areaValue;
    }

    public String getAreaUnit() {
        return areaUnit;
    }

    public void setAreaUnit(String areaUnit) {
        this.areaUnit = areaUnit;
    }

    public BigDecimal getGuntas() {
        return guntas;
    }

    public void setGuntas(BigDecimal guntas) {
        this.guntas = guntas;
    }

    public String getFlatNo() {
        return flatNo;
    }

    public void setFlatNo(String flatNo) {
        this.flatNo = flatNo;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public String getVillageOrTown() {
        return villageOrTown;
    }

    public void setVillageOrTown(String villageOrTown) {
        this.villageOrTown = villageOrTown;
    }

    public String getMandal() {
        return mandal;
    }

    public void setMandal(String mandal) {
        this.mandal = mandal;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getNorthBoundary() {
        return northBoundary;
    }

    public void setNorthBoundary(String northBoundary) {
        this.northBoundary = northBoundary;
    }

    public String getSouthBoundary() {
        return southBoundary;
    }

    public void setSouthBoundary(String southBoundary) {
        this.southBoundary = southBoundary;
    }

    public String getEastBoundary() {
        return eastBoundary;
    }

    public void setEastBoundary(String eastBoundary) {
        this.eastBoundary = eastBoundary;
    }

    public String getWestBoundary() {
        return westBoundary;
    }

    public void setWestBoundary(String westBoundary) {
        this.westBoundary = westBoundary;
    }

    public Suit getSuit() {
        return suit;
    }

    public void setSuit(Suit suit) {
        this.suit = suit;
    }

    public String getContext() {
        return context;
    }
    public void setContext(String context) {
        this.context = context;
    }
    

    // Constructors, getters, setters, and other methods as needed

    // Remember to adjust the column names and data types as needed for your database schema
}
