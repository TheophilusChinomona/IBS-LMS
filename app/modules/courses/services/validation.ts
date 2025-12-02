import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.string().min(1),
  outcomes: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional().default(''),
  status: z.enum(['draft', 'published']),
  createdBy: z.string().min(1)
});
