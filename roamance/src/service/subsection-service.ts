import { api } from '@/api/roamance-api';
import { SUBSECTION_ENDPOINTS } from '@/constants/api';
import {
  SubsectionBriefResponse,
  SubsectionDetailResponse,
  SubsectionListResponse,
  SubsectionRequest,
} from '@/types/subsection';

class SubsectionService {
  /**
   * Create a new subsection
   * @param subsection The subsection data to create
   * @returns The created subsection
   */
  async createSubsection(subsection: SubsectionRequest): Promise<SubsectionDetailResponse> {
    try {
      const response = await api.post<SubsectionDetailResponse, SubsectionRequest>(
        SUBSECTION_ENDPOINTS.CREATE,
        subsection
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create subsection:', error);
      throw error;
    }
  }

  /**
   * Get all subsections by journal ID
   * @param journalId The journal ID to get subsections for
   * @returns List of subsections belonging to the journal
   */
  async getSubsectionsByJournalId(journalId: string): Promise<SubsectionListResponse> {
    try {
      const response = await api.get<SubsectionListResponse>(
        `${SUBSECTION_ENDPOINTS.ROOT}?journalId=${journalId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get subsections by journal ID:', error);
      throw error;
    }
  }

  /**
   * Get a subsection by its ID
   * @param id The subsection ID
   * @returns The subsection detail
   */
  async getSubsectionById(id: string): Promise<SubsectionDetailResponse> {
    try {
      const response = await api.get<SubsectionDetailResponse>(
        SUBSECTION_ENDPOINTS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get subsection by ID:', error);
      throw error;
    }
  }

  /**
   * Update a subsection
   * @param id The subsection ID to update
   * @param subsection The updated subsection data
   * @returns The updated subsection
   */
  async updateSubsection(id: string, subsection: SubsectionRequest): Promise<SubsectionDetailResponse> {
    try {
      const response = await api.put<SubsectionDetailResponse, SubsectionRequest>(
        SUBSECTION_ENDPOINTS.UPDATE(id),
        subsection
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update subsection:', error);
      throw error;
    }
  }

  /**
   * Delete a subsection
   * @param id The subsection ID to delete
   * @returns Success/failure response
   */
  async deleteSubsection(id: string): Promise<SubsectionBriefResponse> {
    try {
      const response = await api.delete<SubsectionBriefResponse>(
        SUBSECTION_ENDPOINTS.DELETE(id)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to delete subsection:', error);
      throw error;
    }
  }

  /**
   * Batch create multiple subsections for a journal
   * @param journalId The journal ID
   * @param subsections Array of subsection data to create
   * @returns The list of created subsections
   */
  async batchCreateSubsections(
    journalId: string,
    subsections: SubsectionRequest[]
  ): Promise<SubsectionListResponse> {
    try {
      // Map subsections to ensure they all have the correct journal_id
      const preparedSubsections = subsections.map(sub => ({
        ...sub,
        journal_id: journalId
      }));

      const response = await api.post<SubsectionListResponse, { subsections: SubsectionRequest[] }>(
        `${SUBSECTION_ENDPOINTS.ROOT}/batch`,
        { subsections: preparedSubsections }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to batch create subsections:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const subsectionService = new SubsectionService();
