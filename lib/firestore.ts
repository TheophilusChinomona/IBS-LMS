import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Course, Enrolment, Lesson, Module } from '@/types/models';

export const courseCollection = collection(firestore, 'courses');
export const enrolmentCollection = collection(firestore, 'enrolments');

export const getPublishedCourses = async (): Promise<Course[]> => {
  const q = query(courseCollection, where('status', '==', 'published'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Course) }));
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const snapshot = await getDoc(doc(courseCollection, courseId));
  return snapshot.exists() ? ({ id: snapshot.id, ...(snapshot.data() as Course) } as Course) : null;
};

export const getModulesForCourse = async (courseId: string): Promise<Module[]> => {
  const modulesRef = collection(firestore, `courses/${courseId}/modules`);
  const q = query(modulesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Module) }));
};

export const getLessonsForModule = async (courseId: string, moduleId: string): Promise<Lesson[]> => {
  const lessonsRef = collection(firestore, `courses/${courseId}/modules/${moduleId}/lessons`);
  const q = query(lessonsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Lesson) }));
};

export const getUserEnrolments = async (userId: string): Promise<Enrolment[]> => {
  const q = query(enrolmentCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Enrolment) }));
};

export const createCourse = async (payload: Omit<Course, 'id'>) => {
  const docRef = await addDoc(courseCollection, payload);
  return docRef.id;
};

export const updateCourse = async (courseId: string, payload: Partial<Course>) => {
  await updateDoc(doc(courseCollection, courseId), payload);
};

export const createEnrolment = async (userId: string, courseId: string) => {
  const payload: Omit<Enrolment, 'id'> = {
    userId,
    courseId,
    status: 'active',
    progressPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(enrolmentCollection, payload);
  return docRef.id;
};
