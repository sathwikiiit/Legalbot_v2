package com.legal.legalbot;

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
    protected String plaintiffs;

    @Column(name="Defendants")
    protected String defendants;

    @Column(name="Plaintiff1")
    protected String plaintiff1;

    @Column(name="Defendant1")
    protected String defendant1;

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
        return plaintiff1+" vs "+defendant1;
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


    public String getPlaintiffs() {
        return plaintiffs;
    }


    public void setPlaintiffs(String plaintiffs) {
        this.plaintiffs = plaintiffs;
    }


    public String getDefendants() {
        return defendants;
    }


    public void setDefendants(String defendants) {
        this.defendants = defendants;
    }


    public String getPlaintiff1() {
        return plaintiff1;
    }


    public void setPlaintiff1(String plaintiff1) {
        this.plaintiff1 = plaintiff1;
    }


    public String getDefendant1() {
        return defendant1;
    }


    public void setDefendant1(String defendant1) {
        this.defendant1 = defendant1;
    }


    public List<Property> getProperty() {
        return property;
    }


    public void setProperty(List<Property> property) {
        this.property = property;
    }

}
