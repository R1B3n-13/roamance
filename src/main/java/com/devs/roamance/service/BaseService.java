package com.devs.roamance.service;

import com.devs.roamance.dto.response.BaseResponseDto;

public interface BaseService<R, E, L, C, U, I> {

  R create(C createRequestDto);

  E get(I id);

  L getAll(int pageNumber, int pageSize, String sortBy, String sortDir);

  R update(U updateRequestDto, I id);

  BaseResponseDto delete(I id);
}
