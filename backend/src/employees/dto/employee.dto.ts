import { z } from 'zod';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;
export const EMPLOYMENT_STATUSES = ['ACTIVE', 'RESIGNED', 'TERMINATED', 'ON_LEAVE'] as const;

const dateField = z
  .string()
  .regex(DATE_RE, 'Must be YYYY-MM-DD')
  .nullable()
  .optional();

export const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1),
  name: z.string().min(1),
  userId: z.string().cuid().nullable().optional(),
  orgUnitId: z.string().cuid().nullable().optional(),
  shiftTypeId: z.string().cuid().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  gender: z.enum(GENDERS).nullable().optional(),
  birthDate: dateField,
  nationality: z.string().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  hireDate: dateField,
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
