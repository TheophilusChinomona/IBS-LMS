export const ROLES = ['learner', 'admin', 'instructor', 'superadmin'] as const;
export type Role = typeof ROLES[number];

export const DEFAULT_ROLE: Role = 'learner';
