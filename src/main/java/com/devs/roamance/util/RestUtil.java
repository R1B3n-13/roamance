package com.devs.roamance.util;

import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RestUtil {

  @Async
  public CompletableFuture<byte[]> downloadMedia(String url) {

    try {
      if (url == null) {
        throw new IllegalArgumentException("Invalid media URL!");
      }

      RestTemplate restTemplate = new RestTemplate();
      byte[] imageBytes = restTemplate.getForObject(new URI(url), byte[].class);

      if (imageBytes == null) {
        throw new IOException("Failed to download media!");
      }

      return CompletableFuture.completedFuture(imageBytes);

    } catch (Exception e) {

      return CompletableFuture.failedFuture(e);
    }
  }
}
