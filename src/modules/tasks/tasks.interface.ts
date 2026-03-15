import { TaskStatus } from '../../../prisma/generated/enums';

export interface ITaskFilters {
  title?: string;
  status?: TaskStatus;
  leadId?: string;
  assignedToId?: string;
  search?: string;
}
