package com.legal.legalbot.model;

import java.util.Date;
import java.util.List;

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

}
