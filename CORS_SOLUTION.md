# CORS Oplossing voor API Integratie

## Probleem
De browser blokkeert API calls naar `https://api.bytomorrow.nl` vanwege CORS (Cross-Origin Resource Sharing) policy.

**Foutmelding:**
```
❌ API Service Error: Failed to fetch
TypeError: Failed to fetch
```

## Huidige Oplossing
Tijdelijk gebruik van mock data door `USE_TEST_CONFIG = false` te zetten in `services/apiService.ts`.

## Permanente Oplossingen

### Optie 1: Server-side Proxy (Aanbevolen)
Voeg een proxy endpoint toe aan je backend:

```javascript
// Express.js voorbeeld
app.get('/api/proxy/*', async (req, res) => {
  const url = `https://api.bytomorrow.nl${req.params[0]}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': req.headers.authorization,
      'Accept': 'application/json'
    }
  });
  const data = await response.json();
  res.json(data);
});
```

### Optie 2: CORS Headers op API Server
Vraag de API provider om CORS headers toe te voegen:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Optie 3: Development Proxy
Voor development gebruik een proxy in `app.json`:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "build": {
        "babel": {
          "include": ["@babel/plugin-proposal-export-namespace-from"]
        }
      }
    }
  }
}
```

### Optie 4: Browser Extension (Development Only)
Voor development kun je een CORS browser extension gebruiken, maar dit werkt niet voor eindgebruikers.

## Test Commands

### cURL Test (Werkt)
```bash
curl -s "https://api.bytomorrow.nl/v1/on-demand?tags=short&limit=5" \
-H "Authorization: M2U5MjgwOGE3OTQ4OTc5YjBkOTBhZmMxMTIwNmMxZTQ4NDc3N2Q4YjJhMTliYzU4NmYzNWRhNzM5MWRiOTkyNQ==" \
-H "Accept: application/json"
```

### Browser Test (Faalt)
```javascript
fetch('https://api.bytomorrow.nl/v1/on-demand?tags=short&limit=5', {
  headers: {
    'Authorization': 'M2U5MjgwOGE3OTQ4OTc5YjBkOTBhZmMxMTIwNmMxZTQ4NDc3N2Q4YjJhMTliYzU4NmYzNWRhNzM5MWRiOTkyNQ==',
    'Accept': 'application/json'
  }
})
```

## Implementatie Plan

1. **Korte termijn**: Mock data gebruiken (✅ Geïmplementeerd)
2. **Middellange termijn**: Server-side proxy implementeren
3. **Lange termijn**: CORS headers op API server krijgen

## API Response Structure

De API retourneert deze structuur:
```json
[
  {
    "id": 63080,
    "hash": "f615628510=",
    "url": "https://vvterneuzen.bytomorrow.nl/watch/f615628510=",
    "title": "short 1",
    "description": "short 1 tekst",
    "tags": "short",
    "thumbnail": "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=fe1mq5Mt",
    "creation_date": "2025-09-16 08:33:00"
  }
]
```

## Status
- ✅ Mock data geïmplementeerd
- ✅ App werkt zonder CORS errors
- ⏳ Server-side proxy in ontwikkeling
- ⏳ CORS headers aanvragen bij API provider
