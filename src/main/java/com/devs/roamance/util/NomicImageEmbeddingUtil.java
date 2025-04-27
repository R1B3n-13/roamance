package com.devs.roamance.util;

import com.devs.roamance.dto.response.ai.EmbeddingResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Client for the Nomic Embed Vision API that handles image embedding generation */
@Component
public class NomicImageEmbeddingUtil {

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  /**
   * Batch embedding of multiple image URLs
   *
   * @param apiKey Nomic API key
   * @param imageUrls List of image URLs to embed
   * @return List of embedding responses
   */
  public List<EmbeddingResponse> embedImageUrls(String apiKey, List<String> imageUrls)
      throws IOException, InterruptedException {

    String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
    String formDataTemplate = "--%s\r\nContent-Disposition: form-data; name=\"%s\"\r\n\r\n%s\r\n";

    StringBuilder formData = new StringBuilder();
    formData.append(String.format(formDataTemplate, boundary, "model", "nomic-embed-vision-v1.5"));

    for (String url : imageUrls) {
      formData.append(String.format(formDataTemplate, boundary, "urls", url));
    }

    formData.append("--").append(boundary).append("--\r\n");

    String apiEndpoint = "https://api-atlas.nomic.ai/v1/embedding/image";
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(apiEndpoint))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .POST(HttpRequest.BodyPublishers.ofString(formData.toString()))
            .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    if (response.statusCode() != 200) {
      throw new IOException(
          "API call failed with status code: "
              + response.statusCode()
              + ", message: "
              + response.body());
    }

    return parseBatchResponse(response.body());
  }

  /** Parse the API response for multiple images */
  @SuppressWarnings("unchecked")
  private List<EmbeddingResponse> parseBatchResponse(String responseBody) throws IOException {

    Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
    List<EmbeddingResponse> results = new ArrayList<>();

    String responseMapKey = "embeddings";
    if (responseMap.containsKey(responseMapKey)
        && responseMap.get(responseMapKey) instanceof List) {

      List<List<Double>> embeddings = (List<List<Double>>) responseMap.get(responseMapKey);

      addEmbeddingsToFloatArray(embeddings, results);
    }

    return results;
  }

  /** Add the embeddings to results list */
  private void addEmbeddingsToFloatArray(
      List<List<Double>> embeddings, List<EmbeddingResponse> results) {

    for (List<Double> embeddingList : embeddings) {

      float[] embedding = new float[embeddingList.size()];

      for (int i = 0; i < embeddingList.size(); i++) {
        embedding[i] = embeddingList.get(i).floatValue();
      }

      results.add(new EmbeddingResponse(embedding));
    }
  }
}
