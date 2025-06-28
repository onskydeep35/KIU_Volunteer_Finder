export interface LoadEventsRequest {
  creator_id?: string;
  org_title?: string;
  category?: string;
  hits_min?: number;
  hits_max?: number;
  country?: string;
  page?: number;
  limit?: number;
}