package com.devs.roamance.service.impl;

import com.devs.roamance.constant.ResponseMessage;
import com.devs.roamance.dto.request.social.PostRequestDto;
import com.devs.roamance.dto.response.BaseResponseDto;
import com.devs.roamance.dto.response.social.PostDto;
import com.devs.roamance.dto.response.social.PostListResponseDto;
import com.devs.roamance.dto.response.social.PostResponseDto;
import com.devs.roamance.dto.response.user.UserDto;
import com.devs.roamance.dto.response.user.UserListResponseDto;
import com.devs.roamance.exception.ResourceNotFoundException;
import com.devs.roamance.exception.UnauthorizedActionException;
import com.devs.roamance.exception.UserNotFoundException;
import com.devs.roamance.model.social.Post;
import com.devs.roamance.model.user.User;
import com.devs.roamance.repository.PostRepository;
import com.devs.roamance.repository.UserRepository;
import com.devs.roamance.service.PostService;
import com.devs.roamance.util.PaginationSortingUtil;
import com.devs.roamance.util.UserUtil;
import java.util.List;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostServiceImpl implements PostService {

  private final PostRepository postRepository;
  private final UserRepository userRepository;
  private final UserUtil userUtil;
  private final ModelMapper modelMapper;

  public PostServiceImpl(
      PostRepository postRepository,
      UserRepository userRepository,
      UserUtil userUtil,
      ModelMapper modelMapper) {

    this.postRepository = postRepository;
    this.userRepository = userRepository;
    this.userUtil = userUtil;
    this.modelMapper = modelMapper;
  }

  @Override
  @Transactional
  public PostResponseDto create(PostRequestDto createRequestDto) {

    UUID userId = userUtil.getAuthenticatedUser().getId();

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new UserNotFoundException(
                        String.format(ResponseMessage.USER_NOT_FOUND_ID, userId)));

    Post post = modelMapper.map(createRequestDto, Post.class);

    post.setUser(user);

    postRepository.save(post);

    PostDto dto = modelMapper.map(post, PostDto.class);

    return new PostResponseDto(201, true, ResponseMessage.POST_CREATE_SUCCESS, dto);
  }

  @Override
  public PostResponseDto get(UUID postId) {

    Post post =
        postRepository
            .findById(postId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        String.format(ResponseMessage.POST_NOT_FOUND, postId)));

    PostDto dto = modelMapper.map(post, PostDto.class);

    return new PostResponseDto(200, true, ResponseMessage.POST_FETCH_SUCCESS, dto);
  }

  @Override
  public PostListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir) {

    Pageable pageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(PaginationSortingUtil.getSortDirection(sortDir), sortBy));

    Page<Post> posts = postRepository.findAll(pageable);

    List<PostDto> dtos = posts.stream().map(post -> modelMapper.map(post, PostDto.class)).toList();

    return new PostListResponseDto(200, true, ResponseMessage.POSTS_FETCH_SUCCESS, dtos);
  }

  @Override
  public PostListResponseDto getByIds(
      List<UUID> postIds, int pageNumber, int pageSize, String sortBy, String sortDir) {

    Pageable pageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(PaginationSortingUtil.getSortDirection(sortDir), sortBy));

    UUID[] idsArray = postIds.toArray(new UUID[0]);

    Page<Post> posts = postRepository.findAllByIds(idsArray, pageable);

    List<PostDto> dtos = posts.stream().map(post -> modelMapper.map(post, PostDto.class)).toList();

    return new PostListResponseDto(200, true, ResponseMessage.POSTS_FETCH_SUCCESS, dtos);
  }

  @Override
  public PostListResponseDto getByUserId(
      UUID userId, int pageNumber, int pageSize, String sortBy, String sortDir) {

    Pageable pageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(PaginationSortingUtil.getSortDirection(sortDir), sortBy));

    Page<Post> posts = postRepository.findAllByUserId(userId, pageable);

    List<PostDto> dtos = posts.stream().map(post -> modelMapper.map(post, PostDto.class)).toList();

    return new PostListResponseDto(200, true, ResponseMessage.POSTS_FETCH_SUCCESS, dtos);
  }

  @Override
  public PostListResponseDto getSavedByCurrentUser(
      int pageNumber, int pageSize, String sortBy, String sortDir) {

    Pageable pageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(PaginationSortingUtil.getSortDirection(sortDir), sortBy));

    UUID userId = userUtil.getAuthenticatedUser().getId();

    Page<Post> posts = postRepository.findAllBySavedBy_Id(userId, pageable);

    List<PostDto> dtos = posts.stream().map(post -> modelMapper.map(post, PostDto.class)).toList();

    return new PostListResponseDto(200, true, ResponseMessage.POSTS_FETCH_SUCCESS, dtos);
  }

  @Override
  public UserListResponseDto getUsersWhoLiked(
      UUID postId, int pageNumber, int pageSize, String sortBy, String sortDir) {

    Pageable pageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(PaginationSortingUtil.getSortDirection(sortDir), sortBy));

    Page<User> users = userRepository.findAllByLikedPosts_Id(postId, pageable);

    List<UserDto> dtos = users.stream().map(user -> modelMapper.map(user, UserDto.class)).toList();

    return new UserListResponseDto(200, true, ResponseMessage.USERS_FETCH_SUCCESS, dtos);
  }

  @Override
  @Transactional
  public PostResponseDto update(PostRequestDto updateRequestDto, UUID postId) {

    Post existingPost =
        postRepository
            .findById(postId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        String.format(ResponseMessage.POST_NOT_FOUND, postId)));

    UUID userId = userUtil.getAuthenticatedUser().getId();

    if (existingPost.getUser().getId() != userId) {
      throw new UnauthorizedActionException(ResponseMessage.POST_UPDATE_ACTION_DENIED);
    }

    if (updateRequestDto.getText() != null && !updateRequestDto.getText().isEmpty()) {
      existingPost.setText(updateRequestDto.getText());
    }
    if (updateRequestDto.getImagePaths() != null && !updateRequestDto.getImagePaths().isEmpty()) {
      existingPost.getImagePaths().addAll(updateRequestDto.getImagePaths());
    }
    if (updateRequestDto.getVideoPaths() != null && !updateRequestDto.getVideoPaths().isEmpty()) {
      existingPost.getVideoPaths().addAll(updateRequestDto.getVideoPaths());
    }

    Post savedPost = postRepository.save(existingPost);

    PostDto dto = modelMapper.map(savedPost, PostDto.class);

    return new PostResponseDto(200, true, ResponseMessage.POST_UPDATE_SUCCESS, dto);
  }

  @Override
  @Transactional
  public BaseResponseDto save(UUID postId) {

    if (!postRepository.existsById(postId)) {
      throw new ResourceNotFoundException(String.format(ResponseMessage.POST_NOT_FOUND, postId));
    }

    UUID userId = userUtil.getAuthenticatedUser().getId();

    if (!userRepository.existsById(userId)) {
      throw new UserNotFoundException(String.format(ResponseMessage.USER_NOT_FOUND_ID, userId));
    }

    boolean isSaved = postRepository.isSavedByUser(postId, userId);

    if (isSaved) {

      postRepository.unsaveByUser(postId, userId);

      return new BaseResponseDto(200, true, ResponseMessage.POST_UNSAVE_SUCCESS);
    } else {

      postRepository.saveByUser(postId, userId);

      return new BaseResponseDto(200, true, ResponseMessage.POST_SAVE_SUCCESS);
    }
  }

  @Override
  @Transactional
  public BaseResponseDto like(UUID postId) {

    Post post =
        postRepository
            .findById(postId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        String.format(ResponseMessage.POST_NOT_FOUND, postId)));

    UUID userId = userUtil.getAuthenticatedUser().getId();

    if (!userRepository.existsById(userId)) {
      throw new UserNotFoundException(String.format(ResponseMessage.USER_NOT_FOUND_ID, userId));
    }

    boolean isLiked = postRepository.isLikedByUser(postId, userId);

    if (isLiked) {

      post.decrementLikesCount();
      postRepository.unlikeByUser(postId, userId);

      postRepository.save(post);

      return new BaseResponseDto(200, true, ResponseMessage.POST_UNLIKE_SUCCESS);
    } else {

      post.incrementLikesCount();
      postRepository.likeByUser(postId, userId);

      postRepository.save(post);

      return new BaseResponseDto(200, true, ResponseMessage.POST_LIKE_SUCCESS);
    }
  }

  @Override
  public BaseResponseDto delete(UUID postId) {

    Post post =
        postRepository
            .findById(postId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        String.format(ResponseMessage.POST_NOT_FOUND, postId)));

    UUID userId = userUtil.getAuthenticatedUser().getId();

    if (post.getUser().getId() != userId) {

      throw new UnauthorizedActionException(ResponseMessage.POST_DELETE_ACTION_DENIED);
    }

    postRepository.delete(post);

    return new BaseResponseDto(200, true, ResponseMessage.POST_DELETE_SUCCESS);
  }
}
