package com.legal.legalbot.services;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.legal.legalbot.model.Party;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TemplateProcessor {
    private static Document doc;
    public static void processTemplate(Document docu, String templateName, Map<String, ?> data, DocWriter docWriter) {
        TemplateProcessor.doc = docu;
        Element templateElement = getTemplateByName(templateName);
        if (templateElement != null) {
            processElement(templateElement, data, docWriter);
        }
        docWriter.addPageBreak();
    }

    private static void processElement(Element element, Map<String, ?> data, DocWriter docWriter) {
        String tagName = element.getTagName();
        NodeList childNodes = element.getChildNodes();
        boolean hasChildElements = false;

        for (int i = 0; i < childNodes.getLength(); i++) {
            if (childNodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
                hasChildElements = true;
                break;
            }
        }

        if (tagName.equalsIgnoreCase("Include")) {
            String componentName = element.getAttribute("component");
            Element component = getComponentByName(componentName);
            if (component != null) {
                processElement(component, data, docWriter); // Process the component
            }
        } else if (tagName.equalsIgnoreCase("List")) { // Handle List
            List<String> listItems = new ArrayList<>(); // changed
            Integer level = Integer.parseInt(element.getAttribute("level")); 
            for (int i = 0; i < childNodes.getLength(); i++) {
                Node node = childNodes.item(i);
                if (node.getNodeType() == Node.ELEMENT_NODE) {
                    Element childElement = (Element) node;
                    if (childElement.getTagName().equalsIgnoreCase("Content")) {
                        boolean shouldProcess = true;
                        if (shouldProcess) {
                            String textContent = childElement.getTextContent();
                            textContent = replacePlaceholders(textContent, data);
                            listItems.add(textContent); // Add to the list
                        }
                    } else if (childElement.getTagName().equalsIgnoreCase("Para")) {
                        String textContent = childElement.getTextContent();
                        textContent = replacePlaceholders(textContent, data);
                        listItems.add(textContent);
                    }
                }
            }
            if (!listItems.isEmpty()) {
                docWriter.addListParagraph(listItems, false, level); // Use addListParagraph
            }
        }
        else {
            //handle the condition.
            boolean shouldProcess = true;
            if (element.hasAttribute("condition")) {
                String condition = element.getAttribute("condition");
                String valueStr = element.getAttribute("value");
                shouldProcess = evaluateCondition(condition, valueStr, data);
            }

            if (shouldProcess) {
                if (!hasChildElements) {
                    String textContent = element.getTextContent();
                    textContent = replacePlaceholders(textContent, data);
                    String align = element.hasAttribute("align") ? element.getAttribute("align").toUpperCase().substring(0, 1) : "L"; // Default to Left
                    boolean bold = element.hasAttribute("bold") && element.getAttribute("bold").equalsIgnoreCase("true");
                    boolean underlined = element.hasAttribute("underlined") && element.getAttribute("underlined").equalsIgnoreCase("true");
                    boolean indent = element.hasAttribute("indent") && element.getAttribute("indent").equalsIgnoreCase("true");
                    docWriter.addParagraph(textContent, bold, align, indent, underlined);
                }

                for (int i = 0; i < childNodes.getLength(); i++) {
                    Node node = childNodes.item(i);
                    if (node.getNodeType() == Node.ELEMENT_NODE) {
                        processElement((Element) node, data, docWriter);
                    }
                }
            }
        }
    }

    private static String replacePlaceholders(String text, Map<String, ?> data) {
        Pattern pattern = Pattern.compile("\\[\\[(\\w+):value:(\\w+)\\]\\]");
        Matcher matcher = pattern.matcher(text);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String key = matcher.group(1);
            String valueKey = matcher.group(2); // this is the "value" or "shortened"
            String replacement = "";
            if (data.containsKey(key.toLowerCase())) {
                Object value = data.get(key.toLowerCase());
                if (value != null) {
                    if (valueKey.equalsIgnoreCase("value")) {
                        replacement =value.toString();
                    } else if (valueKey.equalsIgnoreCase("shortened")) {
                        if (value instanceof Party[]) {
                            Party[] parties = (Party[]) value;
                            if (parties.length == 1) {
                                replacement = parties[0].getName();
                            } else if (parties.length == 2) {
                                replacement = parties[0].getName() + " and another";
                            } else if (parties.length > 2){
                                replacement = parties[0].getName() + " and others";
                            }
                        } else {
                            replacement = String.valueOf(value);
                        }
                    }
                    else if(valueKey.equalsIgnoreCase("index"))
                    {
                         if (value instanceof Party[]) {
                            Party[] list = (Party[]) value;
                            if (list.length!=0) {
                                replacement = String.valueOf(list[0]); //get first element.
                            }
                        } else {
                            replacement = String.valueOf(value);
                        }
                    }
                    else if (valueKey.equalsIgnoreCase("affiant_index")) {
                        if (value instanceof Party[]) {
                            Party[] list = (Party[]) value;
                            if (list.length!=0) {
                                replacement = String.valueOf(list[0]); // First affiant
                            }
                        }
                        else{
                            replacement = String.valueOf(value);
                        }

                    }
                }
            }
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private static Element getTemplateByName(String templateName) {
        NodeList templates = doc.getElementsByTagName("Template");
        for (int i = 0; i < templates.getLength(); i++) {
            Node templateNode = templates.item(i);
            if (templateNode.getNodeType() == Node.ELEMENT_NODE) {
                Element templateElement = (Element) templateNode;
                if (templateElement.getAttribute("name").equalsIgnoreCase(templateName)) {
                    return templateElement;
                }
            }
        }
        return null;
    }

    private static Element getComponentByName(String componentName) {
        NodeList components = doc.getElementsByTagName("Component");
        for (int i = 0; i < components.getLength(); i++) {
            Node componentNode = components.item(i);
            if (componentNode.getNodeType() == Node.ELEMENT_NODE) {
                Element componentElement = (Element) componentNode;
                if (componentElement.getAttribute("name").equalsIgnoreCase(componentName)) {
                    return componentElement;
                }
            }
        }
        return null;
    }

    private static boolean evaluateCondition(String condition, String valueStr, Map<String, ?> data) {
        String[] parts = condition.split(":");
        if (parts.length < 2) {
            return false; // Invalid condition format
        }

        String key = parts[0];
        String preOperator = parts[1];
        String operator = parts.length > 2 ? parts[2] : "";
        Object dataValue = data.get(key.toLowerCase());
        if (dataValue == null) {
            return false; // Key not found in data
        }
        Object comparable;
        if (preOperator.equalsIgnoreCase("length")){
            if (dataValue instanceof Party[]){
                comparable = ((Party[])dataValue).length;
            } else {
                comparable = ((Object[])dataValue).length;
            }
        } else if (preOperator.equalsIgnoreCase("value")){
            comparable = dataValue;
        } else{
            comparable = dataValue;
        }

        if (operator.equalsIgnoreCase("equals")) {
            return comparable.toString().equals(valueStr);
        } else if (operator.equalsIgnoreCase("greaterthan")) {
            if (preOperator.equalsIgnoreCase("length")) {
                if (dataValue instanceof Party[]) {
                    int length = ((Party []) dataValue).length;
                    try {
                        int compareValue = Integer.parseInt(valueStr);
                        return length > compareValue;
                    } catch (NumberFormatException e) {
                        return false; // Invalid comparison value
                    }
                }
            }
        }
        else if (operator.equalsIgnoreCase("lessthan")){
             if (preOperator.equalsIgnoreCase("length")) {
                if (dataValue instanceof Party[]) {
                    int length = ((Party[]) dataValue).length;
                    try {
                        int compareValue = Integer.parseInt(valueStr);
                        return length < compareValue;
                    } catch (NumberFormatException e) {
                        return false; // Invalid comparison value
                    }
                }
            }
        }

        return false;
    }
}

