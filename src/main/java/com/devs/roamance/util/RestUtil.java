package com.devs.roamance.util;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLConnection;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class RestUtil {

  /** Default fallback MIME type */
  private static final String DEFAULT_MIME = "application/octet-stream";

  private final RestTemplate restTemplate = new RestTemplate();
  private final RestUtil self;

  public RestUtil(@Lazy RestUtil self) {
    this.self = self;
  }

  /** Simple holder for downloaded bytes + resolved MIME type. */
  public record Media(byte[] content, String mimeType) {

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (!(o instanceof Media(byte[] content1, String type))) return false;
      return Arrays.equals(content, content1) && Objects.equals(mimeType, type);
    }

    @Override
    public int hashCode() {
      return 31 * Arrays.hashCode(content) + Objects.hashCode(mimeType);
    }

    @Override
    @NonNull
    public String toString() {
      return "Media[mimeType=" + mimeType + ", contentLength=" + content.length + "]";
    }
  }

  /**
   * Downloads a single media file asynchronously and determines its MIME type.
   *
   * @param url the URL of the media to download
   * @return a CompletableFuture containing the downloaded bytes + MIME type
   */
  @Async("asyncExecutor")
  public CompletableFuture<Media> downloadMediaWithMime(String url) {

    if (url == null || url.isBlank()) {
      return CompletableFuture.failedFuture(new IllegalArgumentException("Invalid media URL"));
    }

    try {
      ResponseEntity<byte[]> resp =
          restTemplate.exchange(URI.create(url), HttpMethod.GET, HttpEntity.EMPTY, byte[].class);

      byte[] bytes = resp.getBody();
      if (bytes == null || bytes.length == 0) {
        return CompletableFuture.failedFuture(new IOException("No content at " + url));
      }

      String mime = extractMime(resp.getHeaders(), bytes);
      return CompletableFuture.completedFuture(new Media(bytes, mime));

    } catch (Exception e) {
      log.error("Error fetching {}: {}", url, e.getMessage(), e);
      return CompletableFuture.failedFuture(e);
    }
  }

  /**
   * Downloads multiple media files in parallel, each with its detected MIME type.
   *
   * @param urls list of media URLs
   * @return a CompletableFuture mapping each URL to its Media
   */
  @Async("asyncExecutor")
  public CompletableFuture<Map<String, Media>> downloadMultipleMediaWithMime(List<String> urls) {

    if (urls == null || urls.isEmpty()) {
      return CompletableFuture.completedFuture(Collections.emptyMap());
    }

    List<CompletableFuture<Map.Entry<String, Media>>> futures =
        urls.stream()
            .map(
                u ->
                    self.downloadMediaWithMime(u)
                        .thenApply(media -> Map.entry(u, media))
                        .exceptionally(
                            e -> {
                              log.error("Failed {}: {}", u, e.getMessage());
                              return null;
                            }))
            .toList();

    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
        .thenApply(
            v ->
                futures.stream()
                    .map(CompletableFuture::join)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
  }

  /** Extracts the MIME type from headers, falling back to byte‐sniffing. */
  private String extractMime(HttpHeaders headers, byte[] content) {
    MediaType ct = headers.getContentType();
    if (ct != null && !ct.isWildcardType() && !DEFAULT_MIME.equals(ct.toString())) {
      return ct.toString();
    }
    return guessMime(content);
  }

  /** Uses Java’s built‐in stream sniffing on the first bytes of content. */
  private String guessMime(byte[] content) {
    try (var in = new ByteArrayInputStream(content)) {
      String guessed = URLConnection.guessContentTypeFromStream(in);
      return (guessed != null ? guessed : DEFAULT_MIME);
    } catch (IOException e) {
      log.warn("MIME sniff failed: {}", e.getMessage());
      return DEFAULT_MIME;
    }
  }
}
