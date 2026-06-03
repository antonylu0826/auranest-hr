import { z } from 'zod';

export const DEPENDENT_RELATIONSHIPS = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'] as const;
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const createEmployeeDependentSchema = z.object({
  employeeId: z.string().cuid(),
  name: z.string().min(1),
  relationship: z.enum(DEPENDENT_RELATIONSHIPS),
  gender: z.enum(GENDERS).nullable().optional(),
  birthDate: z.string().regex(DATE_RE, 'Must be YYYY-MM-DD').nullable().optional(),
  nationalId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateEmployeeDependentInput = z.infer<typeof createEmployeeDependentSchema>;
export const updateEmployeeDependentSchema = createEmployeeDependentSchema.partial();
export type UpdateEmployeeDependentInput = z.infer<typeof updateEmployeeDependentSchema>;