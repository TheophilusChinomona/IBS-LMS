import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Course, Enrolment, Lesson, Module } from '@/types/models';

export const courseCollection = collection(firestore, 'courses');
export const enrolmentCollection = collection(firestore, 'enrolments');

/**
 * Fetches all published courses ordered by title for consistent catalog display.
 */
export const getPublishedCourses = async (): Promise<Course[]> => {
  const q = query(courseCollection, where('status', '==', 'published'), orderBy('title', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Course) }));
};

/**
 * Retrieves a course by id or returns null when it does not exist.
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const snapshot = await getDoc(doc(courseCollection, courseId));
  return snapshot.exists() ? ({ id: snapshot.id, ...(snapshot.data() as Course) } as Course) : null;
};

/**
 * Lists modules for a course ordered by their defined order field.
 */
export const getModulesForCourse = async (courseId: string): Promise<Module[]> => {
  const modulesRef = collection(firestore, `courses/${courseId}/modules`);
  const q = query(modulesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Module) }));
};

/**
 * Retrieves lessons for a given course module ordered for sequential playback.
 */
export const getLessonsForCourseModule = async (courseId: string, moduleId: string): Promise<Lesson[]> => {
  const lessonsRef = collection(firestore, `courses/${courseId}/modules/${moduleId}/lessons`);
  const q = query(lessonsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Lesson) }));
};

/**
 * Returns all enrolments for a specific learner.
 */
export const getUserEnrolments = async (userId: string): Promise<Enrolment[]> => {
  if (!userId) return [];
  const q = query(enrolmentCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Enrolment) }));
};

/**
 * Finds a single enrolment for a learner/course pair when it exists.
 */
export const getEnrolmentForUserAndCourse = async (
  userId: string,
  courseId: string
): Promise<Enrolment | null> => {
  const q = query(
    enrolmentCollection,
    where('userId', '==', userId),
    where('courseId', '==', courseId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  const enrolmentDoc = snapshot.docs[0];
  return enrolmentDoc ? ({ id: enrolmentDoc.id, ...(enrolmentDoc.data() as Enrolment) } as Enrolment) : null;
};

/**
 * Creates an enrolment when one does not already exist for the learner and course.
 */
export const createEnrolment = async (userId: string, courseId: string): Promise<void> => {
  const existing = await getEnrolmentForUserAndCourse(userId, courseId);
  if (existing) return;

  const payload: Omit<Enrolment, 'id'> = {
    userId,
    courseId,
    status: 'active',
    progressPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await addDoc(enrolmentCollection, payload);
};

/**
 * Admin helper to create a course document.
 */
export const createCourse = async (payload: Omit<Course, 'id'>) => {
  const docRef = await addDoc(courseCollection, payload);
  return docRef.id;
};

/**
 * Admin helper to update course fields.
 */
export const updateCourse = async (courseId: string, payload: Partial<Course>) => {
  await updateDoc(doc(courseCollection, courseId), payload);
};
