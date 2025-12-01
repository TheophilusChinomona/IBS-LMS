import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.string().min(1),
  outcomes: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published'])
});
