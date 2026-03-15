export interface IAuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

export interface ICreateAuditLog {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
}

export interface IAuditFilters {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
}