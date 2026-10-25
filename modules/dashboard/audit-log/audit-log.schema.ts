export type AuditLogRow = {
  uuid: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetUuid: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: Date;
};
