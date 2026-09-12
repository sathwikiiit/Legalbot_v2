package com.legal.legalbot.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.legal.legalbot.model.Property;

public class PropertyDto {
    private Long id;
    private String type;
    private String mkvalue;
    private String extent;
    private String syn;
    private String hn;
    private String plotNo;
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

    // getters and setters...

    public static PropertyDto fromEntity(Property property) {
        if (property == null) return null;
        PropertyDto dto = new PropertyDto();
        dto.setId(property.getId());
        dto.setType(property.getType());
        dto.setMkvalue(property.getmkvalue());
        dto.setExtent(property.getExtent());
        dto.setSyn(property.getSyn());
        dto.setHn(property.getHn());
        dto.setPlotNo(property.getPlotNo());
        dto.setAreaValue(property.getAreaValue());
        dto.setAreaUnit(property.getAreaUnit());
        dto.setGuntas(property.getGuntas());
        dto.setFlatNo(property.getFlatNo());
        dto.setBuildingName(property.getBuildingName());
        dto.setStreet(property.getStreet());
        dto.setLocality(property.getLocality());
        dto.setVillageOrTown(property.getVillageOrTown());
        dto.setMandal(property.getMandal());
        dto.setDistrict(property.getDistrict());
        dto.setState(property.getState());
        dto.setPincode(property.getPincode());
        dto.setNorthBoundary(property.getNorthBoundary());
        dto.setSouthBoundary(property.getSouthBoundary());
        dto.setEastBoundary(property.getEastBoundary());
        dto.setWestBoundary(property.getWestBoundary());
        return dto;
    }

    public static Property toEntity(PropertyDto dto) {
        if (dto == null) return null;
        Property property = new Property();
        property.setId(dto.getId());
        property.setType(dto.getType());
        property.setmkvalue(dto.getMkvalue());
        property.setExtent(dto.getExtent());
        property.setSyn(dto.getSyn());
        property.setHn(dto.getHn());
        property.setPlotNo(dto.getPlotNo());
        property.setAreaValue(dto.getAreaValue());
        property.setAreaUnit(dto.getAreaUnit());
        property.setGuntas(dto.getGuntas());
        property.setFlatNo(dto.getFlatNo());
        property.setBuildingName(dto.getBuildingName());
        property.setStreet(dto.getStreet());
        property.setLocality(dto.getLocality());
        property.setVillageOrTown(dto.getVillageOrTown());
        property.setMandal(dto.getMandal());
        property.setDistrict(dto.getDistrict());
        property.setState(dto.getState());
        property.setPincode(dto.getPincode());
        property.setNorthBoundary(dto.getNorthBoundary());
        property.setSouthBoundary(dto.getSouthBoundary());
        property.setEastBoundary(dto.getEastBoundary());
        property.setWestBoundary(dto.getWestBoundary());
        return property;
    }

    public static List<PropertyDto> fromEntityList(List<Property> properties) {
        return properties == null ? null : properties.stream().map(PropertyDto::fromEntity).collect(Collectors.toList());
    }

    public static List<Property> toEntityList(List<PropertyDto> dtos) {
        return dtos == null ? null : dtos.stream().map(PropertyDto::toEntity).collect(Collectors.toList());
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

    public String getMkvalue() {
        return mkvalue;
    }

    public void setMkvalue(String mkvalue) {
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

    public BigDecimal getAreaValue() { return areaValue; }
    public void setAreaValue(BigDecimal areaValue) { this.areaValue = areaValue; }
    public String getAreaUnit() { return areaUnit; }
    public void setAreaUnit(String areaUnit) { this.areaUnit = areaUnit; }
    public BigDecimal getGuntas() { return guntas; }
    public void setGuntas(BigDecimal guntas) { this.guntas = guntas; }
    public String getFlatNo() { return flatNo; }
    public void setFlatNo(String flatNo) { this.flatNo = flatNo; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }
    public String getVillageOrTown() { return villageOrTown; }
    public void setVillageOrTown(String villageOrTown) { this.villageOrTown = villageOrTown; }
    public String getMandal() { return mandal; }
    public void setMandal(String mandal) { this.mandal = mandal; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getNorthBoundary() { return northBoundary; }
    public void setNorthBoundary(String northBoundary) { this.northBoundary = northBoundary; }
    public String getSouthBoundary() { return southBoundary; }
    public void setSouthBoundary(String southBoundary) { this.southBoundary = southBoundary; }
    public String getEastBoundary() { return eastBoundary; }
    public void setEastBoundary(String eastBoundary) { this.eastBoundary = eastBoundary; }
    public String getWestBoundary() { return westBoundary; }
    public void setWestBoundary(String westBoundary) { this.westBoundary = westBoundary; }
}
