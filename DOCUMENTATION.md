# Sport Club Video Platform - Jump Video App

Een moderne React Native app gebouwd met Expo voor het bekijken van sportclub content, nieuws, wedstrijden en video's.

## 📱 App Overzicht

Deze app is een volledig functioneel platform voor sportclubs waar gebruikers:
- Clubs kunnen selecteren en beheren
- Video content kunnen bekijken (shorts en lange video's)
- Nieuws kunnen lezen
- Wedstrijdinformatie kunnen bekijken
- Favorieten kunnen beheren
- Instellingen kunnen aanpassen

## 🏗️ Technische Stack

### Core Technologies
- **React Native**: 0.79.1
- **Expo**: 53.0.4
- **TypeScript**: 5.8.3
- **Expo Router**: File-based routing systeem

### State Management
- **@tanstack/react-query**: Server state management
- **@nkzw/create-context-hook**: Local state management
- **AsyncStorage**: Lokale data opslag
- **Zustand**: Global state (indien nodig)

### UI & Styling
- **React Native StyleSheet**: Native styling
- **Lucide React Native**: Icon library
- **Expo Linear Gradient**: Gradient effects
- **Expo Blur**: Blur effects

### Backend & Data
- **Firebase**: Backend services
  - Firestore: Database
  - Firebase Messaging: Push notifications
- **Mock Data**: Fallback data systeem

### Notifications
- **Expo Notifications**: Push notifications
- **Firebase Cloud Messaging**: Cross-platform messaging

## 📁 Project Structure

```
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout met providers
│   ├── index.tsx                # Entry point
│   ├── splash.tsx               # Splash screen
│   ├── club-selection.tsx       # Club selectie scherm
│   ├── (tabs)/                  # Tab navigation
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── home.tsx             # Home tab
│   │   ├── matches.tsx          # Wedstrijden tab
│   │   ├── nieuws.tsx           # Nieuws tab
│   │   ├── fanzone.tsx          # Favorieten tab
│   │   └── meer.tsx             # Meer opties tab
│   ├── profile.tsx              # Profiel pagina
│   ├── settings.tsx             # Instellingen
│   ├── notifications.tsx        # Notificaties
│   ├── clubs-manage.tsx         # Club beheer
│   ├── help-support.tsx         # Help & Support
│   ├── shorts-player.tsx        # Shorts video player
│   ├── video-player.tsx         # Lange video player
│   ├── match-detail.tsx         # Wedstrijd details
│   └── news-article.tsx         # Nieuws artikel
├── providers/                    # Context providers
│   ├── ClubProvider.tsx         # Club state management
│   ├── FavoritesProvider.tsx    # Favorieten management
│   ├── ThemeProvider.tsx        # Theme management
│   ├── SettingsProvider.tsx     # App instellingen
│   └── LanguageProvider.tsx     # Taal instellingen
├── services/                     # API services
│   ├── clubService.ts           # Club data service
│   └── notificationService.ts   # Notification service
├── mocks/                        # Mock data
│   ├── clubs.ts                 # Club mock data
│   ├── videos.ts                # Video mock data
│   ├── news.ts                  # Nieuws mock data
│   └── matches.ts               # Wedstrijd mock data
├── types/                        # TypeScript types
│   └── club.ts                  # Club type definitions
├── config/                       # Configuration
│   └── firebase.ts              # Firebase configuratie
└── assets/                       # Static assets
    └── images/                   # App icons en images
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 of hoger)
- Bun package manager
- Expo CLI
- Firebase project (optioneel)

### Installation

1. **Clone het project**
   ```bash
   git clone <repository-url>
   cd sport-club-video-platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start de development server**
   ```bash
   # Voor mobile development
   bun run start
   
   # Voor web development
   bun run start-web
   
   # Voor web development met debug logs
   bun run start-web-dev
   ```

4. **Open de app**
   - Scan de QR code met Expo Go app (iOS/Android)
   - Of open in web browser voor web versie

## 🔥 Firebase Setup

### Firebase Configuration

De app gebruikt Firebase voor backend services. Volg deze stappen:

1. **Maak een Firebase project**
   - Ga naar [Firebase Console](https://console.firebase.google.com/)
   - Maak een nieuw project: `jump-video`

2. **Configureer Firebase**
   - De Firebase config is al ingesteld in `config/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "AIzaSyB8sJuxbpeW6KmDQYWCV_WCekZPLuq7JUQ",
     authDomain: "jump-video.firebaseapp.com",
     projectId: "jump-video",
     storageBucket: "jump-video.firebasestorage.app",
     messagingSenderId: "805890269523",
     appId: "1:805890269523:web:4d81eb3e9d0dbdbbe481a6",
     measurementId: "G-CNSXZPHN4D"
   };
   ```

3. **Firestore Database Setup**
   - Maak een Firestore database
   - Stel security rules in (zie hieronder)

### Firestore Security Rules

Kopieer deze rules naar je Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to clubs collection
    match /clubs/{document=**} {
      allow read: if true;
      allow write: if false;
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

### Firestore Collections

De app verwacht deze collections in Firestore:

#### `clubs` Collection
```typescript
{
  name: string;           // Club naam (verplicht)
  subtitle?: string;      // Club ondertitel
  type?: string;          // Club type/categorie
  logo?: string;          // Logo URL
  description?: string;   // Club beschrijving
  isActive?: boolean;     // Of club actief is
  createdAt?: Timestamp;  // Aanmaak datum
  updatedAt?: Timestamp;  // Update datum
}
```

#### `news` Collection
```typescript
{
  title: string;          // Nieuws titel
  content: string;        // Nieuws inhoud
  summary?: string;       // Korte samenvatting
  imageUrl?: string;      // Afbeelding URL
  publishedAt: Timestamp; // Publicatie datum
  clubId?: string;        // Gekoppelde club ID
}
```

#### `matches` Collection
```typescript
{
  homeTeam: string;       // Thuisteam
  awayTeam: string;       // Uitteam
  date: Timestamp;        // Wedstrijd datum
  homeScore?: number;     // Thuisscore
  awayScore?: number;     // Uitscore
  status: string;         // Wedstrijd status
  venue?: string;         // Locatie
}
```

#### `videos` Collection
```typescript
{
  title: string;          // Video titel
  description?: string;   // Video beschrijving
  url: string;           // Video URL
  thumbnailUrl?: string; // Thumbnail URL
  duration?: number;     // Duur in seconden
  type: 'short' | 'long'; // Video type
  clubId?: string;       // Gekoppelde club ID
}
```

## 🎯 Features

### ✅ Geïmplementeerde Features

1. **Club Management**
   - Club selectie en beheer
   - Firebase integratie met fallback naar mock data
   - Lokale opslag van geselecteerde clubs
   - Zoekfunctionaliteit

2. **Navigation System**
   - Tab-based navigation
   - Stack navigation voor details
   - Conditional tab rendering (nieuws tab kan worden uitgeschakeld)

3. **Video Platform**
   - Shorts player voor korte video's
   - Lange video player
   - Video thumbnails en metadata

4. **News System**
   - Nieuws artikelen
   - Nieuws detail pagina's
   - Configureerbare nieuws tab

5. **Match Information**
   - Wedstrijd overzicht
   - Wedstrijd details
   - Live scores (indien beschikbaar)

6. **Settings & Preferences**
   - App instellingen
   - Taal instellingen
   - Theme management
   - Notificatie instellingen

7. **Favorites System**
   - Favoriete content markeren
   - Favorieten beheer

8. **Notifications**
   - Push notifications via Firebase
   - Lokale notificaties
   - Notificatie geschiedenis

### 🔄 Data Flow

1. **App Start**
   - Splash screen wordt getoond
   - Firebase configuratie wordt gecontroleerd
   - Clubs worden geladen (Firebase → fallback naar mock data)
   - Gebruiker wordt doorgestuurd naar club selectie of home

2. **Club Selection**
   - Clubs worden opgehaald van Firebase/mock data
   - Gebruiker selecteert clubs
   - Selectie wordt opgeslagen in AsyncStorage
   - Gebruiker wordt doorgestuurd naar home

3. **Main App**
   - Tab navigation wordt getoond
   - Content wordt geladen per tab
   - Real-time updates via Firebase (indien geconfigureerd)

## 🛠️ Development

### Scripts

```bash
# Start development server
bun run start

# Start web development
bun run start-web

# Start web development met debug
bun run start-web-dev

# Lint code
bun run lint
```

### Code Style

- **TypeScript**: Strict type checking
- **ESLint**: Code linting met Expo config
- **Functional Components**: React hooks pattern
- **Context Providers**: Voor state management
- **Async/Await**: Voor asynchrone operaties

### State Management Pattern

```typescript
// Provider pattern met @nkzw/create-context-hook
export const [Provider, useHook] = createContextHook(() => {
  const [state, setState] = useState();
  
  // Firebase integration
  const query = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });
  
  // AsyncStorage persistence
  useEffect(() => {
    AsyncStorage.setItem('key', JSON.stringify(state));
  }, [state]);
  
  return { state, actions };
});
```

## 📱 Platform Support

### Mobile (iOS/Android)
- ✅ Volledig ondersteund
- ✅ Native navigation
- ✅ Push notifications
- ✅ Offline storage
- ✅ Camera access (indien nodig)

### Web
- ✅ React Native Web compatibiliteit
- ✅ Responsive design
- ✅ Web notifications (beperkt)
- ⚠️ Sommige native features niet beschikbaar

## 🔧 Troubleshooting

### Veelvoorkomende Problemen

1. **Firebase Connection Issues**
   ```
   Error: Firebase is not properly configured
   ```
   **Oplossing**: Controleer `config/firebase.ts` configuratie

2. **No Clubs Found**
   ```
   No clubs found in Firebase. Using mock data.
   ```
   **Oplossing**: Voeg clubs toe aan Firestore `clubs` collection

3. **Permission Denied**
   ```
   Missing or insufficient permissions
   ```
   **Oplossing**: Update Firestore security rules

4. **App Crashes on Startup**
   - Controleer console logs
   - Clear AsyncStorage cache
   - Restart development server

### Debug Commands

```bash
# Clear all cache
# In app: Settings → Clear All Cache

# View console logs
# Browser: F12 → Console
# Mobile: Expo Dev Tools → Logs

# Reset AsyncStorage
# In app: Settings → Clear All Cache
```

## 📦 Dependencies

### Core Dependencies
- `expo`: ^53.0.4 - Expo framework
- `react`: 19.0.0 - React library
- `react-native`: 0.79.1 - React Native framework
- `expo-router`: ~5.0.3 - File-based routing
- `typescript`: ~5.8.3 - TypeScript support

### State Management
- `@tanstack/react-query`: ^5.83.0 - Server state
- `@nkzw/create-context-hook`: ^1.1.0 - Context hooks
- `@react-native-async-storage/async-storage`: 2.1.2 - Local storage

### UI & Navigation
- `lucide-react-native`: ^0.475.0 - Icons
- `expo-linear-gradient`: ~14.1.4 - Gradients
- `expo-blur`: ~14.1.4 - Blur effects
- `react-native-gesture-handler`: ~2.24.0 - Gestures

### Backend & Services
- `firebase`: ^12.2.1 - Firebase SDK
- `expo-notifications`: ~0.31.4 - Push notifications

## 🚀 Deployment

### Development
- App draait lokaal via Expo Go
- Web versie beschikbaar via browser
- Hot reloading voor snelle development

### Production
- **Expo Go**: Voor testing en development
- **Custom Build**: Voor app store deployment (niet geconfigureerd)
- **Web Hosting**: Voor web versie deployment

## 📄 License

Dit project is ontwikkeld voor [Organisatie Naam]. Alle rechten voorbehouden.

## 🤝 Contributing

Voor bijdragen aan dit project:

1. Fork het repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Maak een Pull Request

## 📞 Support

Voor vragen of problemen:
- Check de troubleshooting sectie
- Bekijk de console logs
- Contacteer het development team

---

**Laatste update**: December 2024
**Versie**: 1.0.0
**Expo SDK**: 53.0.4