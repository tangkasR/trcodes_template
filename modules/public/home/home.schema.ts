export type SystemStats = {
  totalUsers: number;
  totalRoles: number;
  totalFeatures: number;
  totalItems: number;
  totalAuditLogs: number;
};

export type FeatureHighlight = {
  key: string;
  title: string;
  tag: string;
  description: string;
  icon: string;
  points: string[];
};

export type ArchitecturePillar = {
  layer: string;
  path: string;
  description: string;
  rules: string[];
};
