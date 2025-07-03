import type { ApplicationStatus } from "../models/application";

export interface UpdateApplicationStatusRequest {
  application_id: string;
  updated_application_status: ApplicationStatus;
}