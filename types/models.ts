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

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts?: number | null;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: 'single' | 'multi' | 'truefalse';
  options: string[];
  correctOptionIndexes: number[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: QuizAnswer[];
  createdAt: string | Date;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionIndexes: number[];
}

export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  courseId: string;
  userId: string;
  fileUrl?: string;
  textResponse?: string;
  status: 'submitted' | 'graded';
  grade?: number;
  passed?: boolean;
  feedback?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string | Date;
  certificateNumber: string;
  downloadUrl?: string;
}
