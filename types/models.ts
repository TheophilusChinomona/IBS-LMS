import type { Role } from '@/config/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  outcomes: string[];
  thumbnailUrl?: string;
  status: 'draft' | 'published';
  createdBy: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'mixed';
  content?: string;
  resourceUrl?: string;
  order: number;
}

export interface Enrolment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed';
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}
