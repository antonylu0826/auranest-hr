import { z } from 'zod';

export const ORG_UNIT_LEVELS = ['COMPANY', 'DIVISION', 'DEPARTMENT', 'TEAM'] as const;

export const createOrgUnitSchema = z.object({
  name: z.string().min(1),
  level: z.enum(ORG_UNIT_LEVELS),
  parentId: z.string().cuid().nullable().optional(),
  headId: z.string().cuid().nullable().optional(),
});

export type CreateOrgUnitInput = z.infer<typeof createOrgUnitSchema>;
export const updateOrgUnitSchema = createOrgUnitSchema.partial();
export type UpdateOrgUnitInput = z.infer<typeof updateOrgUnitSchema>;
