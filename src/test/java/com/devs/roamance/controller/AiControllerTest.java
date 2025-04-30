package com.devs.roamance.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

import com.devs.roamance.dto.request.ai.AiPoweredItineraryCreateRequestDto;
import com.devs.roamance.dto.request.ai.MultiModalRagRequestDto;
import com.devs.roamance.dto.request.ai.UniModalAiRequestDto;
import com.devs.roamance.dto.response.ai.AiPoweredItineraryResponseDto;
import com.devs.roamance.dto.response.ai.PostIdListRagSearchDto;
import com.devs.roamance.dto.response.social.PostListResponseDto;
import com.devs.roamance.service.AiService;
import com.devs.roamance.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.context.request.async.DeferredResult;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {

  @Mock private AiService aiService;

  @Mock private PostService postService;

  @InjectMocks private AiController aiController;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  @DisplayName("Should generate proofreading content")
  void generateProofreadingShouldReturnFluxOfStrings() {
    // Given
    UniModalAiRequestDto requestDto = new UniModalAiRequestDto();
    requestDto.setText("This is a sample text that needs proofreading.");

    // Mock AiService behavior to emit to the sink
    doAnswer(
            invocation -> {
              Sinks.Many<String> sink = invocation.getArgument(1);
              sink.tryEmitNext("Proofreading result 1");
              sink.tryEmitNext("Proofreading result 2");
              sink.tryEmitComplete();
              return null;
            })
        .when(aiService)
        .getProofreading(any(UniModalAiRequestDto.class), any());

    // When
    Flux<String> result = aiController.generateProofreading(requestDto);

    // Then
    StepVerifier.create(result)
        .expectNext("Proofreading result 1")
        .expectNext("Proofreading result 2")
        .expectComplete()
        .verify();
  }

  @Test
  @DisplayName("Should perform RAG search and return posts")
  void ragSearchPostsShouldReturnPostList() throws Exception {
    // Given
    MockHttpServletRequest request = new MockHttpServletRequest();
    RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

    MultiModalRagRequestDto requestDto = new MultiModalRagRequestDto();
    requestDto.setQuery("travel recommendations in Paris");

    List<UUID> postIds = new ArrayList<>();
    postIds.add(UUID.randomUUID());
    postIds.add(UUID.randomUUID());

    PostIdListRagSearchDto postIdsDto = new PostIdListRagSearchDto();
    postIdsDto.setPostIds(postIds);

    PostListResponseDto postListDto = new PostListResponseDto();
    postListDto.setStatus(200);
    postListDto.setSuccess(true);
    postListDto.setMessage("Posts fetched successfully");

    CompletableFuture<PostIdListRagSearchDto> future =
        CompletableFuture.completedFuture(postIdsDto);
    when(aiService.getPostIdsUsingRag(any(MultiModalRagRequestDto.class))).thenReturn(future);
    when(postService.getByIds(anyList(), anyInt(), anyInt())).thenReturn(postListDto);

    // When
    DeferredResult<ResponseEntity<PostListResponseDto>> deferredResult =
        aiController.ragSearchPosts(requestDto, 0, 10);

    // Wait for the result to be set
    while (!deferredResult.hasResult()) {
      Thread.sleep(100);
    }

    // Then
    @SuppressWarnings("unchecked")
    ResponseEntity<PostListResponseDto> response =
        (ResponseEntity<PostListResponseDto>) deferredResult.getResult();

    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(true, response.getBody().isSuccess());
  }

  @Test
  @DisplayName("Should generate AI-powered itinerary")
  void generateItineraryShouldReturnItinerary() throws Exception {
    // Given
    MockHttpServletRequest request = new MockHttpServletRequest();
    RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

    AiPoweredItineraryCreateRequestDto requestDto = new AiPoweredItineraryCreateRequestDto();
    requestDto.setLocation("Paris");
    requestDto.setNumberOfDays(5);
    requestDto.setBudgetLevel("MEDIUM");
    requestDto.setNumberOfPeople(2);
    requestDto.setStartDate(LocalDate.now());

    AiPoweredItineraryResponseDto responseDto = new AiPoweredItineraryResponseDto();
    responseDto.setStatus(200);
    responseDto.setSuccess(true);
    responseDto.setMessage("Itinerary generated successfully");

    CompletableFuture<AiPoweredItineraryResponseDto> future =
        CompletableFuture.completedFuture(responseDto);
    when(aiService.getAiPoweredItinerary(any(AiPoweredItineraryCreateRequestDto.class)))
        .thenReturn(future);

    // When
    DeferredResult<ResponseEntity<AiPoweredItineraryResponseDto>> deferredResult =
        aiController.generateItinerary(requestDto);

    // Wait for the result to be set
    while (!deferredResult.hasResult()) {
      Thread.sleep(100);
    }

    // Then
    @SuppressWarnings("unchecked")
    ResponseEntity<AiPoweredItineraryResponseDto> response =
        (ResponseEntity<AiPoweredItineraryResponseDto>) deferredResult.getResult();

    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(true, response.getBody().isSuccess());
  }
}
