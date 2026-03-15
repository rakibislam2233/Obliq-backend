import { LeadStatus } from '../../../prisma/generated/enums';

export interface ILeadFilters {
  fullName?: string;
  email?: string;
  source?: string;
  status?: LeadStatus;
  assignedToId?: string;
  search?: string;
}
