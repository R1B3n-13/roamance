package com.devs.roamance.service;

import com.devs.roamance.dto.common.AiPoweredItineraryDto;
import com.devs.roamance.dto.request.NearByFindRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ItineraryCreateRequestDto;
import com.devs.roamance.dto.request.travel.itinerary.ItineraryUpdateRequestDto;
import com.devs.roamance.dto.response.travel.itinerary.ItineraryListResponseDto;
import com.devs.roamance.dto.response.travel.itinerary.ItineraryResponseDto;
import java.util.UUID;

public interface ItineraryService
    extends BaseService<
        ItineraryResponseDto,
        ItineraryResponseDto,
        ItineraryCreateRequestDto,
        ItineraryUpdateRequestDto,
        UUID> {
  ItineraryResponseDto createWithDetails(AiPoweredItineraryDto createRequestDto);

  ItineraryListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir);

  ItineraryListResponseDto getByUserId(
      UUID userId, int pageNumber, int pageSize, String sortBy, String sortDir);

  ItineraryListResponseDto getNearby(
      NearByFindRequestDto requestDto, int pageNumber, int pageSize, String sortBy, String sortDir);
}
