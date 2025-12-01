import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const healthcheck = functions.https.onRequest((_, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: add course publishing hooks, enrolment sync, and analytics events.

/**
 * Placeholder callable function to eventually generate certificates.
 * Validations such as course completion, quiz passes, and assignment grades
 * should be added before issuing certificates in production.
 */
export const generateCertificate = functions.https.onCall(async (data) => {
  const { userId, courseId } = data;
  if (!userId || !courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and courseId are required');
  }

  // TODO: verify learner completion, generate PDF, upload to Storage, and update downloadUrl.
  await admin.firestore().collection('certificates').add({
    userId,
    courseId,
    certificateNumber: `IBS-${courseId}-${userId}-${Date.now()}`,
    issuedAt: new Date().toISOString(),
    downloadUrl: ''
  });

  return { status: 'queued' };
});
