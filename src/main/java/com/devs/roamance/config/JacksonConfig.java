package com.devs.roamance.config;

import com.devs.roamance.model.travel.journal.SubsectionType;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

  @Bean
  public Module subsectionTypeModule() {
    SimpleModule module = new SimpleModule();
    module.addDeserializer(SubsectionType.class, new SubsectionTypeDeserializer());
    return module;
  }
}
