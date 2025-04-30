import api from '@/api/roamance-api';
import { JOURNAL_ENDPOINTS, SUBSECTION_ENDPOINTS } from '@/constants/api';
import {
  JournalBrief,
  JournalBriefResponse,
  JournalCreateRequest,
  JournalDetail,
  JournalDetailResponse,
  JournalListResponse
} from '@/types/journal';
import { SubsectionDetailResponse, SubsectionRequest } from '@/types/subsection';
import { AxiosResponse } from 'axios';

class JournalService {
  /**
   * Get all journals for the current user
   */
  async getAllJournals(): Promise<JournalBrief[]> {
    try {
      const response: AxiosResponse<JournalListResponse> = await api.get(
        JOURNAL_ENDPOINTS.ROOT
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching journals:', error);
      throw error;
    }
  }

  /**
   * Get journal details by ID
   */
  async getJournalById(id: string): Promise<JournalDetail> {
    try {
      const response: AxiosResponse<JournalDetailResponse> = await api.get(
        JOURNAL_ENDPOINTS.GET_BY_ID(id)
      );
      const journal = response.data.data;

      // Immediately fetch detailed information for all subsections
      if (journal.subsections && journal.subsections.length > 0) {
        const detailedSubsections = await Promise.all(
          journal.subsections.map(async (subsection) => {
            try {
              const subsectionResponse = await api.get<SubsectionDetailResponse>(
                `${SUBSECTION_ENDPOINTS.GET_BY_ID(subsection.id)}`
              );
              // Return the detailed subsection data
              return subsectionResponse.data.data;
            } catch (error) {
              console.error(`Error fetching subsection ${subsection.id}:`, error);
              // Return original subsection if we fail to get detailed version
              return subsection;
            }
          })
        );

        // Replace journal's subsections array with the detailed subsections
        journal.subsections = detailedSubsections;
      }

      return journal;
    } catch (error) {
      console.error(`Error fetching journal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new journal
   */
  async createJournal(journalData: JournalCreateRequest): Promise<JournalBrief> {
    try {
      const response: AxiosResponse<JournalBriefResponse> = await api.post(
        JOURNAL_ENDPOINTS.CREATE,
        journalData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating journal:', error);
      throw error;
    }
  }

  /**
   * Update an existing journal
   */
  async updateJournal(
    id: string,
    journalData: Partial<JournalCreateRequest>
  ): Promise<JournalBrief> {
    try {
      const response: AxiosResponse<JournalBriefResponse> = await api.put(
        JOURNAL_ENDPOINTS.UPDATE(id),
        journalData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating journal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a journal by ID
   */
  async deleteJournal(id: string): Promise<void> {
    try {
      await api.delete(JOURNAL_ENDPOINTS.DELETE(id));
    } catch (error) {
      console.error(`Error deleting journal with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a subsection to a journal
   */
  async addSubsection(
    journalId: string,
    subsectionData: SubsectionRequest
  ): Promise<JournalDetail> {
    try {
      // First get the current journal
      const journal = await this.getJournalById(journalId);

      // Add the subsection to the journal's update payload
      const updatedJournal = {
        ...journal,
        subsections: [...journal.subsections, subsectionData],
      };

      // Update the journal
      const response: AxiosResponse<JournalDetailResponse> = await api.put(
        JOURNAL_ENDPOINTS.UPDATE(journalId),
        updatedJournal
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error adding subsection to journal ${journalId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a subsection from a journal
   */
  async removeSubsection(journalId: string, subsectionId: string): Promise<JournalDetail> {
    try {
      // First get the current journal
      const journal = await this.getJournalById(journalId);

      // Filter out the subsection to be removed
      const updatedJournal = {
        ...journal,
        subsections: journal.subsections.filter(s => s.id !== subsectionId),
      };

      // Update the journal
      const response: AxiosResponse<JournalDetailResponse> = await api.put(
        JOURNAL_ENDPOINTS.UPDATE(journalId),
        updatedJournal
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error removing subsection ${subsectionId} from journal ${journalId}:`, error);
      throw error;
    }
  }
}

export const journalService = new JournalService();
