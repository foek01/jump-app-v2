# Firestore Security Rules Configuration

## Current Issue
The app is experiencing "Missing or insufficient permissions" errors when trying to access the quiz collection in Firestore.

## Solution
You need to update your Firestore Security Rules in the Firebase Console. Here are the rules you need:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to clubs collection
    match /clubs/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Allow read access to tenants collection
    match /tenants/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Allow read access to quizzes collection
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if false;
      
      // Allow read access to quiz questions subcollection
      match /questions/{questionId} {
        allow read: if true;
        allow write: if false;
      }
    }
    
    // Allow read access to news collection
    match /news/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Allow read access to matches collection
    match /matches/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Allow read access to videos collection
    match /videos/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (jump-video)
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the rules above
6. Click **Publish**

## Important Notes

- These rules allow **read-only** access to all collections
- Write access is disabled for security
- The app will automatically fall back to mock data if Firebase is unavailable
- After publishing the rules, it may take a few minutes for them to take effect

## Testing

After applying the rules, the app should be able to:
- Fetch clubs from Firebase
- Fetch quizzes and quiz questions
- Access news, matches, and videos collections

The error "Missing or insufficient permissions" should no longer appear in the console.