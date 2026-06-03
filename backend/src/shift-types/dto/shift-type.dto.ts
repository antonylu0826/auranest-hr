import { z } from 'zod';

export const SHIFT_CATEGORIES = ['FIXED', 'ROTATING'] as const;

const time = z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:mm').nullable().optional();

export const createShiftTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.enum(SHIFT_CATEGORIES).optional(),
  workStart: time,
  workEnd: time,
  breakStart: time,
  breakEnd: time,
  observeHolidays: z.boolean().optional(),
  flexEarliestStart: time,
  flexLatestStart: time,
  workDaysInCycle: z.number().int().positive().nullable().optional(),
  restDaysInCycle: z.number().int().positive().nullable().optional(),
  cycleAnchorDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateShiftTypeInput = z.infer<typeof createShiftTypeSchema>;
export const updateShiftTypeSchema = createShiftTypeSchema.partial();
export type UpdateShiftTypeInput = z.infer<typeof updateShiftTypeSchema>;
