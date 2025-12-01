# Firestore Security Rules (intended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    match /courses/{courseId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
      allow delete: if isSuperAdmin();
    }

    match /courses/{courseId}/modules/{moduleId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /courses/{courseId}/modules/{moduleId}/lessons/{lessonId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /enrolments/{enrolmentId} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    function isAdmin() {
      return request.auth != null && request.auth.token.role in ['admin', 'instructor', 'superadmin'];
    }

    function isSuperAdmin() {
      return request.auth != null && request.auth.token.role == 'superadmin';
    }
  }
}
```
