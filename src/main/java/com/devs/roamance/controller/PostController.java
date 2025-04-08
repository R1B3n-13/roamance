package com.devs.roamance.controller;

import com.devs.roamance.dto.request.social.PostRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.social.PostListResponseDto;
import com.devs.roamance.dto.response.social.PostResponseDto;
import com.devs.roamance.dto.response.user.UserListResponseDto;
import com.devs.roamance.service.PostService;
import com.devs.roamance.util.PaginationSortingUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
public class PostController {

  private final PostService postService;

  public PostController(PostService postService) {

    this.postService = postService;
  }

  @PostMapping("/create")
  public ResponseEntity<PostResponseDto> createPost(@Valid @RequestBody PostRequestDto requestDto) {

    PostResponseDto responseDto = postService.create(requestDto);

    return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
  }

  @GetMapping
  public ResponseEntity<PostListResponseDto> getAllPosts(
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    PostListResponseDto responseDto =
        postService.getAll(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/{postId}")
  public ResponseEntity<PostResponseDto> getPostById(@PathVariable @NotNull UUID postId) {

    PostResponseDto responseDto = postService.get(postId);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/by-ids")
  public ResponseEntity<PostListResponseDto> getPostsByIds(
      @RequestBody List<UUID> postIds,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    PostListResponseDto responseDto =
        postService.getByIds(postIds, validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/by-user/{userId}")
  public ResponseEntity<PostListResponseDto> getPostsByUserId(
      @PathVariable @NotNull UUID userId,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    PostListResponseDto responseDto =
        postService.getByUserId(userId, validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/saved")
  public ResponseEntity<PostListResponseDto> getSavedPosts(
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    PostListResponseDto responseDto =
        postService.getSavedByCurrentUser(validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @GetMapping("/liked-by/{postId}")
  public ResponseEntity<UserListResponseDto> getUsersWhoLikedPost(
      @PathVariable @NotNull UUID postId,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir) {

    int[] validatedParams = PaginationSortingUtil.validatePaginationParams(pageNumber, pageSize);

    UserListResponseDto responseDto =
        postService.getUsersWhoLiked(
            postId, validatedParams[0], validatedParams[1], sortBy, sortDir);

    return ResponseEntity.ok(responseDto);
  }

  @PutMapping("/update/{postId}")
  public ResponseEntity<PostResponseDto> updatePost(
      @PathVariable @NotNull UUID postId, @Valid @RequestBody PostRequestDto requestDto) {

    PostResponseDto responseDto = postService.update(requestDto, postId);

    return ResponseEntity.ok(responseDto);
  }

  @PostMapping("/save/{postId}")
  public ResponseEntity<BaseResponseDto> savePost(@PathVariable @NotNull UUID postId) {

    BaseResponseDto responseDto = postService.save(postId);

    return ResponseEntity.ok(responseDto);
  }

  @PostMapping("/like/{postId}")
  public ResponseEntity<BaseResponseDto> likePost(@PathVariable @NotNull UUID postId) {

    BaseResponseDto responseDto = postService.like(postId);

    return ResponseEntity.ok(responseDto);
  }

  @DeleteMapping("/delete/{postId}")
  public ResponseEntity<BaseResponseDto> deletePost(@PathVariable @NotNull UUID postId) {

    BaseResponseDto responseDto = postService.delete(postId);

    return ResponseEntity.ok(responseDto);
  }
}
