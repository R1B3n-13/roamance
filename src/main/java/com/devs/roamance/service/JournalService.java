package com.devs.roamance.service;

import com.devs.roamance.dto.request.travel.journal.JournalCreateRequestDto;
import com.devs.roamance.dto.request.travel.journal.JournalUpdateRequestDto;
import com.devs.roamance.dto.response.travel.journal.JournalListResponseDto;
import com.devs.roamance.dto.response.travel.journal.JournalResponseDto;
import java.util.UUID;

public interface JournalService
    extends BaseService<
        JournalResponseDto,
        JournalResponseDto,
        JournalListResponseDto,
        JournalCreateRequestDto,
        JournalUpdateRequestDto,
        UUID> {}
