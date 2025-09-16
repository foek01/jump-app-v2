// Mock data based on real API response structure
export const mockShorts = [
  {
    id: "63080",
    title: "short 1",
    description: "short 1 tekst",
    date: "16-9-2025 08:33",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=fe1mq5Mt",
    videoUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/short-1~f615628510=?autoplay=1&loop=1&muted=1&controls=0&fit=cover",
    duration: null,
    category: "Short",
    tags: ["short"],
    isLive: false,
    // Access control
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "63081",
    title: "short 2 - Premium",
    description: "Premium short content",
    date: "16-9-2025 08:34",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=jKoj1kjs",
    videoUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/short-2~f61662ebca=?autoplay=1&loop=1&muted=1&controls=0&fit=cover",
    duration: null,
    category: "Short",
    tags: ["short", "premium"],
    isLive: false,
    // Access control - Premium content
    privacy: "premium",
    is_free: false,
    login_required: true,
  },
  {
    id: "63082",
    title: "short 3 - Club Only",
    description: "Club exclusive content",
    date: "16-9-2025 08:35",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=BTqMOTAO",
    videoUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/short-3~f6176131a4=?autoplay=1&loop=1&muted=1",
    duration: null,
    category: "Short",
    tags: ["short", "club"],
    isLive: false,
    // Access control - Club members only
    privacy: "private",
    is_free: true,
    login_required: true,
    clubId: "SUw3Aj8Oqsdy8s8sztga",
  },
];

// Mock data for on-demand videos - Based on REAL API data from vvterneuzen.bytomorrow.nl
export const mockVideos = [
  {
    id: "3784",
    title: "PADEL LEVELS: Uitleg van speelsterkte 7, 8 en 9 | KNLTB Padel",
    description: "Uitleg van padel speelsterkte levels",
    date: "3-5-2024 09:43",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=3784",
    videoUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/padel-levels~ec30b4550e?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    category: "PADEL",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    duration: null,
    tags: [], // Geen tags in API
    isLive: false,
    // Access control - Public content
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "3783",
    title: "Premium Training Analysis 🔒",
    description: "Exclusive training analysis - Premium content",
    date: "2-5-2024 15:29",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=3783",
    videoUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/overlay-test~ec20bafaa?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    category: "PREMIUM",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    duration: null,
    tags: ["premium", "training"],
    isLive: false,
    // Access control - Premium content
    privacy: "premium",
    is_free: false,
    login_required: true,
  },
];

// Mock data for live events - Based on REAL API data from vvterneuzen.bytomorrow.nl
export const mockLiveEvents = [
  {
    id: "22155",
    title: "STREAM TOM",
    description: "Live stream van Tom - Login vereist",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=22155",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/stream-tom~566dfb81d2?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-09-16 13:30:00",
    endTime: "2025-09-16 13:44:00",
    isLive: false,
    category: "LIVE STREAM",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: ["live"],
    // Access control - Login required (free for logged in users)
    privacy: "private",
    is_free: true,
    login_required: true,
  },
  {
    id: "21723",
    title: "Test023",
    description: "Test live stream 023",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=21723",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/test023~54be8cfaf2?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-09-11 13:51:00",
    endTime: "2025-09-11 13:51:00",
    isLive: false,
    category: "TEST",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: [], // Geen tags in API
    // Access control - Public test stream
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "20667",
    title: "test",
    description: "Test live event",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=20667",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/test~509feeedd2?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-09-01 10:07:00",
    endTime: "2025-09-01 10:09:00",
    isLive: false,
    category: "TEST",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: [], // Geen tags in API
    // Access control - Public test event
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "19745",
    title: "Test Live D (Original Stream)",
    description: "Test live stream D - originele stream",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=19745",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/test-live-d-original-stream~4d072393aa?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-09-16 13:23:00",
    endTime: "2025-08-22 15:56:00",
    isLive: false,
    category: "LIVE TEST",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: [], // Geen tags in API
    // Access control - Public test stream
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "19744",
    title: "Test Live D",
    description: "Test live stream D",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=19744",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/test-live-d~4d06247940?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-08-22 15:59:00",
    endTime: "2025-08-22 15:59:00",
    isLive: false,
    category: "LIVE TEST",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: [], // Geen tags in API
    // Access control - Public test stream
    privacy: "public",
    is_free: true,
    login_required: false,
  },
  {
    id: "94",
    title: "VV Terneuzen JO19-1 - Roosendaal JO19-1",
    description: "Voetbalwedstrijd JO19-1",
    thumbnail: "https://vvterneuzen.bytomorrow.nl/api/get-asset-thumbnail?file=&media_id=94",
    streamUrl: "https://vvterneuzen.bytomorrow.nl/watch-embed/vv-terneuzen-jo19-1-roosendaal-jo19-1~5de07b94?et=y%2BcFZGmlLdmoVdIOjFRgE8mkRlgh6Zh6c2Q9zkILi3A%3D&autoplay=1&controls=1",
    startTime: "2025-09-16 13:24:00",
    endTime: "2022-12-10 15:00:00",
    isLive: false,
    category: "VOETBAL",
    clubLogo: "https://vvterneuzen.bytomorrow.nl/assets/uploads/club-logo.png",
    tags: [], // Geen tags in API
    // Access control - Public football match
    privacy: "public",
    is_free: true,
    login_required: false,
  },
];