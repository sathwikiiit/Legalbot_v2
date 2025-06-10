package com.legal.legalbot.dto;

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
}
