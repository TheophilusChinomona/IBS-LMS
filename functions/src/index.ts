import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const healthcheck = functions.https.onRequest((_, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: add course publishing hooks, enrolment sync, and analytics events.
