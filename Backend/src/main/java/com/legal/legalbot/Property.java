package com.legal.legalbot;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

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

    public Long getId() {
        return id;
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

    // Constructors, getters, setters, and other methods as needed

    // Remember to adjust the column names and data types as needed for your database schema
}
