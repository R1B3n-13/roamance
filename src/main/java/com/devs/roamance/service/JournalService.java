package com.devs.roamance.service;

import java.util.UUID;

import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;

public interface JournalService
    extends
    BaseService<JournalResponseDto, JournalResponseDto, JournalCreateRequestDto, JournalUpdateRequestDto, UUID> {

  JournalListResponseDto getAll(int pageNumber, int pageSize, String sortBy, String sortDir);
}
