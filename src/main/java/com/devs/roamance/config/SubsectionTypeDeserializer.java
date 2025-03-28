package com.devs.roamance.config;

import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SubsectionTypeDeserializer extends JsonDeserializer<SubsectionType> {
  private static final Logger logger = LoggerFactory.getLogger(SubsectionTypeDeserializer.class);

  @Override
  public SubsectionType deserialize(JsonParser jsonParser, DeserializationContext context)
      throws IOException {
    String value = jsonParser.getText();
    logger.info("Deserializing SubsectionType from value: {}", value);

    try {
      for (SubsectionType type : SubsectionType.values()) {
        if (type.getValue().equalsIgnoreCase(value)) {
          return type;
        }
      }

      return SubsectionType.valueOf(value.toUpperCase());
    } catch (IllegalArgumentException e) {
      logger.error("Could not deserialize SubsectionType from value: {}", value, e);
      return null;
    }
  }
}
