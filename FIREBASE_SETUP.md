# Firebase Setup Instructions

## Firebase Configuration

To use Firebase with this app, you need to configure your Firebase project credentials in `config/firebase.ts`.

### Steps:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one

2. **Enable Firestore Database**
   - In your Firebase project, go to "Firestore Database"
   - Create a database in production mode
   - Set up security rules as needed

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on the web app icon `</>`
   - Copy the configuration object

4. **Update Firebase Config**
   - Open `config/firebase.ts`
   - Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Firestore Collection Structure

The app expects a collection named `tenants` with the following document structure:

```typescript
{
  name: string;           // Required: Club name
  subtitle?: string;      // Optional: Club subtitle (defaults to name)
  type?: string;          // Optional: Club type/category
  category?: string;      // Optional: Alternative to type
  logo?: string;          // Optional: Logo URL
  logoUrl?: string;       // Optional: Alternative logo field
  description?: string;   // Optional: Club description
  isActive?: boolean;     // Optional: Whether club is active (defaults to true)
  createdAt?: Timestamp;  // Optional: Creation timestamp
  updatedAt?: Timestamp;  // Optional: Last update timestamp
}
```

### Example Document:

```json
{
  "name": "Ajax Amsterdam",
  "subtitle": "AFC Ajax",
  "type": "Professional soccer club",
  "logo": "https://example.com/ajax-logo.png",
  "description": "Professional football club from Amsterdam",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Features

- **Real-time Data**: Fetches clubs from Firebase Firestore
- **Fallback Support**: Uses mock data if Firebase is unavailable
- **Search Functionality**: Search clubs by name, subtitle, or type
- **Offline Storage**: Selected clubs are stored locally using AsyncStorage
- **Error Handling**: Graceful error handling with user-friendly messages
- **Pull-to-Refresh**: Refresh clubs data manually

## Usage

The app will automatically:
1. Load clubs from Firebase on startup
2. Display loading state while fetching
3. Show error messages if Firebase is unavailable
4. Fall back to mock data if needed
5. Allow users to search and select clubs
6. Persist selected clubs locally

## Troubleshooting

### Problem: "No clubs found" 

De app kan geen clubs vinden. Dit kan verschillende oorzaken hebben:

#### 1. Firebase niet geconfigureerd
- **Symptoom**: Console toont "Firebase configured: false"
- **Oplossing**: Update `config/firebase.ts` met je echte Firebase configuratie

#### 2. Lege Firestore collection
- **Symptoom**: Console toont "No documents found in tenants collection"
- **Oplossing**: Voeg documenten toe aan de `tenants` collection in Firestore

#### 3. Verkeerde collection naam
- **Symptoom**: Console toont "getDocs completed. Document count: 0"
- **Oplossing**: Controleer of de collection echt `tenants` heet

#### 4. Firestore security rules
- **Symptoom**: Console toont "permission-denied" error
- **Oplossing**: Update Firestore rules om read access toe te staan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tenants/{document} {
      allow read: if true;
    }
  }
}
```

#### 5. Internet connectie problemen
- **Symptoom**: Console toont "unavailable" error
- **Oplossing**: Controleer je internet verbinding

### Debug Console Logs

De app toont nu uitgebreide debug informatie:
- `🔄 ClubProvider: Starting Firebase fetch...`
- `📄 Processing document: { id, dataKeys, name }`
- `✅ Added club: [club name]`
- `🎉 Successfully fetched X clubs from Firebase`

Controleer deze logs in je browser console of React Native debugger.

### Fallback Behavior

Als Firebase niet werkt:
1. App toont error message
2. Valt terug op mock data
3. Gebruiker kan nog steeds de app gebruiken
4. Refresh knop probeert opnieuw te verbinden

- **Firebase Connection Issues**: Check your internet connection and Firebase configuration
- **Empty Club List**: Ensure your Firestore collection `tenants` has documents
- **Permission Errors**: Check Firestore security rules allow read access