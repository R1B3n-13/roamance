package com.devs.roamance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RoamanceApplication {

  public static void main(String[] args) {
    SpringApplication.run(RoamanceApplication.class, args);
  }
}
