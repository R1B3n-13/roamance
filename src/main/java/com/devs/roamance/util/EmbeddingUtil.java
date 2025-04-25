package com.devs.roamance.util;

import com.devs.roamance.dto.response.ai.EmbeddingResponse;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.nomic.NomicEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import java.time.Duration;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmbeddingUtil {

  @Value("${application.pgvector.host}")
  private String host;

  @Value("${application.pgvector.port}")
  private Integer port;

  @Value("${application.pgvector.db}")
  private String vectorDb;

  @Value("${application.pgvector.user}")
  private String user;

  @Value("${application.pgvector.password}")
  private String password;

  public void embedAndStore(
      String apiKey,
      Document document,
      Integer dimension,
      String contentId,
      String taskType,
      String tableName) {

    EmbeddingModel embeddingModel =
        NomicEmbeddingModel.builder()
            .baseUrl("https://api-atlas.nomic.ai/v1/")
            .apiKey(apiKey)
            .modelName("nomic-embed-text-v1.5")
            .taskType(taskType)
            .maxSegmentsPerBatch(1)
            .timeout(Duration.ofSeconds(10))
            .logRequests(true)
            .logResponses(true)
            .build();

    EmbeddingStore<TextSegment> embeddingStore =
        PgVectorEmbeddingStore.builder()
            .host(host)
            .port(port)
            .database(vectorDb)
            .user(user)
            .password(password)
            .table(tableName)
            .dimension(dimension)
            .useIndex(true)
            .indexListSize(100)
            .createTable(true)
            .build();

    EmbeddingStoreIngestor ingestor =
        EmbeddingStoreIngestor.builder()
            .documentTransformer(
                doc -> {
                  doc.metadata().put("contentId", contentId);
                  return doc;
                })
            .documentSplitter(DocumentSplitters.recursive(1000, 200))
            .textSegmentTransformer(
                textSegment ->
                    TextSegment.from(
                        textSegment.metadata().getString(contentId) + "\n" + textSegment.text(),
                        textSegment.metadata()))
            .embeddingModel(embeddingModel)
            .embeddingStore(embeddingStore)
            .build();

    ingestor.ingest(document);
  }

  public void store(
      List<EmbeddingResponse> embeddingResponses,
      Integer dimension,
      String contentId,
      String tableName) {

    EmbeddingStore<TextSegment> embeddingStore =
        PgVectorEmbeddingStore.builder()
            .host(host)
            .port(port)
            .database(vectorDb)
            .user(user)
            .password(password)
            .table(tableName)
            .dimension(dimension)
            .useIndex(true)
            .indexListSize(100)
            .createTable(true)
            .build();

    embeddingResponses.forEach(
        embeddingResponse ->
            embeddingStore.add(
                contentId, new Embedding(embeddingResponse.getEmbedding()))); // need to fix this
  }
}
