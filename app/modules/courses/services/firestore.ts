import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebase';
import type {
  Assignment,
  AssignmentSubmission,
  Certificate,
  Course,
  Enrolment,
  Lesson,
  Module,
  Quiz,
  QuizAttempt
} from '@/types/models';

export const courseCollection = collection(firestore, 'courses');
export const enrolmentCollection = collection(firestore, 'enrolments');

/**
 * Fetches all published courses ordered by title for consistent catalog display.
 */
export const getPublishedCourses = async (): Promise<Course[]> => {
  const q = query(courseCollection, where('status', '==', 'published'), orderBy('title', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Course, 'id'>), id: docSnap.id }));
};

/**
 * Retrieves a course by id or returns null when it does not exist.
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const snapshot = await getDoc(doc(courseCollection, courseId));
  return snapshot.exists() ? { ...(snapshot.data() as Omit<Course, 'id'>), id: snapshot.id } : null;
};

/**
 * Lists modules for a course ordered by their defined order field.
 */
export const getModulesForCourse = async (courseId: string): Promise<Module[]> => {
  const modulesRef = collection(firestore, `courses/${courseId}/modules`);
  const q = query(modulesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Module, 'id'>), id: docSnap.id }));
};

/**
 * Retrieves lessons for a given course module ordered for sequential playback.
 */
export const getLessonsForCourseModule = async (courseId: string, moduleId: string): Promise<Lesson[]> => {
  const lessonsRef = collection(firestore, `courses/${courseId}/modules/${moduleId}/lessons`);
  const q = query(lessonsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Lesson, 'id'>), id: docSnap.id }));
};

/**
 * Returns all enrolments for a specific learner.
 */
export const getUserEnrolments = async (userId: string): Promise<Enrolment[]> => {
  if (!userId) return [];
  const q = query(enrolmentCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Enrolment, 'id'>), id: docSnap.id }));
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
  return enrolmentDoc ? { ...(enrolmentDoc.data() as Omit<Enrolment, 'id'>), id: enrolmentDoc.id } : null;
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

/**
 * Retrieves quizzes that belong to a course.
 */
export const getQuizzesForCourse = async (courseId: string): Promise<Quiz[]> => {
  const quizzesRef = collection(firestore, `courses/${courseId}/quizzes`);
  const snapshot = await getDocs(quizzesRef);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Quiz, 'id'>), id: docSnap.id }));
};

/**
 * Finds a single quiz by id for the provided course.
 */
export const getQuizById = async (courseId: string, quizId: string): Promise<Quiz | null> => {
  const quizRef = doc(firestore, `courses/${courseId}/quizzes/${quizId}`);
  const snapshot = await getDoc(quizRef);
  return snapshot.exists() ? { ...(snapshot.data() as Omit<Quiz, 'id'>), id: snapshot.id } : null;
};

/**
 * Stores a learner quiz attempt for reporting and completion tracking.
 */
export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  const attemptsRef = collection(firestore, 'quizAttempts');
  const payload: QuizAttempt = {
    ...attempt,
    createdAt: attempt.createdAt ?? new Date().toISOString(),
    id: attempt.id || doc(attemptsRef).id
  };

  const attemptDoc = doc(attemptsRef, payload.id);
  await setDoc(attemptDoc, payload);
};

/**
 * Fetches a learner's quiz attempts for a specific quiz.
 */
export const getUserQuizAttemptsForQuiz = async (
  userId: string,
  quizId: string
): Promise<QuizAttempt[]> => {
  if (!userId) return [];
  const attemptsRef = collection(firestore, 'quizAttempts');
  const attemptsQuery = query(attemptsRef, where('userId', '==', userId), where('quizId', '==', quizId));
  const snapshot = await getDocs(attemptsQuery);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<QuizAttempt, 'id'>), id: docSnap.id }));
};

/**
 * Retrieves assignments for a course to support learner submissions.
 */
export const getAssignmentsForCourse = async (courseId: string): Promise<Assignment[]> => {
  const assignmentsRef = collection(firestore, `courses/${courseId}/assignments`);
  const snapshot = await getDocs(assignmentsRef);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Assignment, 'id'>), id: docSnap.id }));
};

/**
 * Fetches a specific assignment document.
 */
export const getAssignmentById = async (
  courseId: string,
  assignmentId: string
): Promise<Assignment | null> => {
  const assignmentRef = doc(firestore, `courses/${courseId}/assignments/${assignmentId}`);
  const snapshot = await getDoc(assignmentRef);
  return snapshot.exists()
    ? { ...(snapshot.data() as Omit<Assignment, 'id'>), id: snapshot.id }
    : null;
};

/**
 * Persists a learner's assignment submission including optional file upload.
 */
export const submitAssignmentSubmission = async (
  submission: AssignmentSubmission,
  file?: File
): Promise<void> => {
  try {
    let fileUrl = submission.fileUrl;
    if (file) {
      const storageRef = ref(
        storage,
        `assignments/${submission.courseId}/${submission.assignmentId}/${submission.userId}/${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(snapshot.ref);
    }

    const submissionsRef = collection(
      firestore,
      `courses/${submission.courseId}/assignments/${submission.assignmentId}/submissions`
    );
    const payload: AssignmentSubmission = {
      ...submission,
      fileUrl,
      createdAt: submission.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: submission.id || doc(submissionsRef).id
    };

    await setDoc(doc(submissionsRef, payload.id), payload);
  } catch (error) {
    console.error('Error submitting assignment', error);
    throw error;
  }
};

/**
 * Returns submissions for a given assignment for instructor review.
 */
export const getSubmissionsForAssignment = async (
  courseId: string,
  assignmentId: string
): Promise<AssignmentSubmission[]> => {
  const submissionsRef = collection(firestore, `courses/${courseId}/assignments/${assignmentId}/submissions`);
  const snapshot = await getDocs(submissionsRef);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<AssignmentSubmission, 'id'>), id: docSnap.id }));
};

/**
 * Updates grading information for an assignment submission.
 */
export const gradeAssignmentSubmission = async (
  courseId: string,
  assignmentId: string,
  submissionId: string,
  grade: number,
  passed: boolean,
  feedback?: string
): Promise<void> => {
  const submissionRef = doc(
    firestore,
    `courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`
  );

  await updateDoc(submissionRef, {
    grade,
    passed,
    feedback: feedback ?? '',
    status: 'graded',
    updatedAt: new Date().toISOString()
  });
};

/**
 * Creates a certificate record for a learner/course combination.
 */
export const createCertificateRecord = async (userId: string, courseId: string): Promise<Certificate> => {
  const certificatesRef = collection(firestore, 'certificates');
  const certificateNumber = `IBS-${courseId}-${userId}-${Date.now()}`;
  const payload: Omit<Certificate, 'id'> = {
    userId,
    courseId,
    issuedAt: new Date().toISOString(),
    certificateNumber,
    downloadUrl: ''
  };

  const docRef = await addDoc(certificatesRef, payload);
  return { id: docRef.id, ...payload };
};

/**
 * Lists certificates for the specified learner.
 */
export const getCertificatesForUser = async (userId: string): Promise<Certificate[]> => {
  if (!userId) return [];
  const certificatesRef = collection(firestore, 'certificates');
  const certificatesQuery = query(certificatesRef, where('userId', '==', userId));
  const snapshot = await getDocs(certificatesQuery);
  return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Omit<Certificate, 'id'>), id: docSnap.id }));
};
