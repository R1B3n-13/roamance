package com.devs.roamance.service;

import com.devs.roamance.dto.response.BaseResponseDto;

public interface BaseService<B, E, C, U, I> {

  B create(C createRequestDto);

  E get(I id);

  B update(U updateRequestDto, I id);

  BaseResponseDto delete(I id);
}
