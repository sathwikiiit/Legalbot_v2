package com.legal.legalbot.services.docgen.legacy;

import java.util.List;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class TemplateProcessor {

    public static void processTemplate(Document doc, String templateName, Map<String, Object> data, DocWriter docWriter) {
        Element templateElement = getElementById(doc, templateName);
        if (templateElement != null) {
            processElement(templateElement, data, docWriter);
        } else {
            System.err.println("Template with name " + templateName + " not found.");
        }
    }

    private static Element getElementById(Document doc, String id) {
        NodeList nodeList = doc.getElementsByTagName("*");
        for (int i = 0; i < nodeList.getLength(); i++) {
            Node node = nodeList.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                Element element = (Element) node;
                if (id.equals(element.getAttribute("name"))) {
                    return element;
                }
            }
        }
        return null;
    }

    private static void processElement(Element element, Map<String, Object> data, DocWriter docWriter) {
        NodeList children = element.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                Element childElement = (Element) node;
                String tagName = childElement.getTagName();

                switch (tagName) {
                    case "p":
                        processParagraph(childElement, data, docWriter);
                        break;
                    case "list":
                        processList(childElement, data, docWriter);
                        break;
                    case "foreach":
                        processForEach(childElement, data, docWriter);
                        break;
                    case "if":
                        processIf(childElement, data, docWriter);
                        break;
                    default:
                        processElement(childElement, data, docWriter);
                }
            }
        }
    }

    private static void processParagraph(Element pElement, Map<String, Object> data, DocWriter docWriter) {
        String rawText = pElement.getTextContent().trim();
        String processedText = replaceVariables(rawText, data);

        String align = pElement.getAttribute("align");
        boolean bold = Boolean.parseBoolean(pElement.getAttribute("bold"));
        boolean underline = Boolean.parseBoolean(pElement.getAttribute("underline"));
        int fontSize = parseInteger(pElement.getAttribute("fontSize"), 12);
        boolean justified = Boolean.parseBoolean(pElement.getAttribute("justified"));
        int firstLineIndent = parseInteger(pElement.getAttribute("firstLineIndent"), 0);
        int lineSpacing = parseInteger(pElement.getAttribute("lineSpacing"), 240);

        if (!processedText.isEmpty()) {
            docWriter.addParagraph(processedText, align, bold, underline, fontSize, justified, firstLineIndent, lineSpacing);
        }
    }

    private static void processList(Element listElement, Map<String, Object> data, DocWriter docWriter) {
        String varName = listElement.getAttribute("var");
        Object varValue = data.get(varName);

        if (varValue instanceof List<?>) {
            List<?> list = (List<?>) varValue;
            for (Object item : list) {
                String rawText = listElement.getTextContent().trim();
                String itemText = rawText.replace("${item}", item != null ? item.toString() : "");
                itemText = replaceVariables(itemText, data);

                String align = listElement.getAttribute("align");
                boolean bold = Boolean.parseBoolean(listElement.getAttribute("bold"));
                boolean underline = Boolean.parseBoolean(listElement.getAttribute("underline"));
                int fontSize = parseInteger(listElement.getAttribute("fontSize"), 12);
                boolean justified = Boolean.parseBoolean(listElement.getAttribute("justified"));

                if (!itemText.isEmpty()) {
                    docWriter.addParagraph(itemText, align, bold, underline, fontSize, justified, 0, 240);
                }
            }
        }
    }

    private static void processForEach(Element forEachElement, Map<String, Object> data, DocWriter docWriter) {
        String itemsKey = forEachElement.getAttribute("items");
        String varName = forEachElement.getAttribute("var");
        Object itemsValue = data.get(itemsKey);

        if (itemsValue instanceof List<?>) {
            List<?> items = (List<?>) itemsValue;
            for (Object item : items) {
                Map<String, Object> localData = new java.util.HashMap<>(data);
                localData.put(varName, item);
                processElement(forEachElement, localData, docWriter);
            }
        }
    }

    private static void processIf(Element ifElement, Map<String, Object> data, DocWriter docWriter) {
        String condition = ifElement.getAttribute("condition");
        if (evaluateCondition(condition, data)) {
            processElement(ifElement, data, docWriter);
        }
    }

    private static String replaceVariables(String text, Map<String, Object> data) {
        if (text == null) return "";
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String key = "${" + entry.getKey() + "}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            text = text.replace(key, value);
        }
        return text;
    }

    private static boolean evaluateCondition(String condition, Map<String, Object> data) {
        if (condition == null || condition.isEmpty()) return false;

        if (condition.startsWith("not ")) {
            String key = condition.substring(4).trim();
            Object value = data.get(key);
            return value == null || (value instanceof Boolean && !((Boolean) value));
        } else {
            Object value = data.get(condition.trim());
            return value != null && (!(value instanceof Boolean) || (Boolean) value);
        }
    }

    private static int parseInteger(String str, int defaultValue) {
        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
