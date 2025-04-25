package com.devs.roamance.util;

import com.devs.roamance.dto.response.ai.EmbeddingResponse;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.input.PromptTemplate;
import dev.langchain4j.model.nomic.NomicEmbeddingModel;
import dev.langchain4j.rag.DefaultRetrievalAugmentor;
import dev.langchain4j.rag.RetrievalAugmentor;
import dev.langchain4j.rag.content.injector.ContentInjector;
import dev.langchain4j.rag.content.injector.DefaultContentInjector;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.rag.query.router.DefaultQueryRouter;
import dev.langchain4j.rag.query.router.QueryRouter;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RagUtil {

  private String metadataKey = "contentId";

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
      String apiKey, Document document, String contentId, String taskType, String tableName) {

    EmbeddingModel embeddingModel = buildEmbeddingModel(apiKey, taskType);

    EmbeddingStore<TextSegment> embeddingStore =
        buildEmbeddingStore(embeddingModel.dimension(), tableName);

    EmbeddingStoreIngestor ingestor =
        EmbeddingStoreIngestor.builder()
            .documentTransformer(
                doc -> {
                  doc.metadata().put(metadataKey, contentId);
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

    EmbeddingStore<TextSegment> embeddingStore = buildEmbeddingStore(dimension, tableName);

    embeddingResponses.forEach(
        embeddingResponse ->
            embeddingStore.add(
                new Embedding(embeddingResponse.getEmbedding()),
                TextSegment.from("An image.", Metadata.from(metadataKey, contentId))));
  }

  public RetrievalAugmentor buildAugmentor(
      String apiKey, String taskType, String textsTableName, String imageDescriptionsTableName) {

    EmbeddingModel embeddingModel = buildEmbeddingModel(apiKey, taskType);

    EmbeddingStore<TextSegment> textsEmbeddingStore =
        buildEmbeddingStore(embeddingModel.dimension(), textsTableName);
    EmbeddingStore<TextSegment> imageDescriptionsEmbeddingStore =
        buildEmbeddingStore(embeddingModel.dimension(), imageDescriptionsTableName);

    ContentRetriever textsContentRetriever =
        EmbeddingStoreContentRetriever.builder()
            .embeddingStore(textsEmbeddingStore)
            .embeddingModel(embeddingModel)
            .maxResults(20)
            .minScore(0.6)
            .build();
    ContentRetriever imageDescriptionsContentRetriever =
        EmbeddingStoreContentRetriever.builder()
            .embeddingStore(imageDescriptionsEmbeddingStore)
            .embeddingModel(embeddingModel)
            .maxResults(20)
            .minScore(0.6)
            .build();

    QueryRouter queryRouter =
        new DefaultQueryRouter(textsContentRetriever, imageDescriptionsContentRetriever);

    ContentInjector contentInjector =
        DefaultContentInjector.builder()
            .promptTemplate(
                PromptTemplate.from(
                    """
                            {{userMessage}}

                            return the relevant contentIds using the following information:
                            {{contents}}"""))
            .metadataKeysToInclude(List.of(metadataKey))
            .build();

    return DefaultRetrievalAugmentor.builder()
        .queryRouter(queryRouter)
        .contentInjector(contentInjector)
        .build();
  }

  private EmbeddingModel buildEmbeddingModel(String apiKey, String taskType) {

    return NomicEmbeddingModel.builder()
        .baseUrl("https://api-atlas.nomic.ai/v1/")
        .apiKey(apiKey)
        .modelName("nomic-embed-text-v1.5")
        .taskType(taskType)
        .maxSegmentsPerBatch(1)
        .timeout(Duration.ofSeconds(10))
        .logRequests(true)
        .logResponses(true)
        .build();
  }

  private EmbeddingStore<TextSegment> buildEmbeddingStore(Integer dimension, String tableName) {

    return PgVectorEmbeddingStore.builder()
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
  }
}
