import { z } from 'zod';

export const createJobTitleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  department: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateJobTitleInput = z.infer<typeof createJobTitleSchema>;
export const updateJobTitleSchema = createJobTitleSchema.partial();
export type UpdateJobTitleInput = z.infer<typeof updateJobTitleSchema>;
