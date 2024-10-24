package com.legal.legalbot;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection="property")
public class Property {
    @Id
    private Long id;

    private String type; // Property type (e.g., land, plot, house)

    private String value; // Property value

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

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
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
