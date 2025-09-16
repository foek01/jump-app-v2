export interface Match {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  image: string;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
}

export const mockMatches: Match[] = [
  {
    id: '1',
    title: 'Ajax vs PSV',
    homeTeam: 'Ajax',
    awayTeam: 'PSV',
    date: '15 Dec',
    time: '20:00',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    status: 'live',
    competition: 'Eredivisie'
  },
  {
    id: '2',
    title: 'Feyenoord vs AZ',
    homeTeam: 'Feyenoord',
    awayTeam: 'AZ',
    date: '15 Dec',
    time: '18:45',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop',
    status: 'live',
    competition: 'Eredivisie'
  },
  {
    id: '3',
    title: 'Utrecht vs Vitesse',
    homeTeam: 'FC Utrecht',
    awayTeam: 'Vitesse',
    date: '16 Dec',
    time: '14:30',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=600&fit=crop',
    status: 'upcoming',
    competition: 'Eredivisie'
  },
  {
    id: '4',
    title: 'Twente vs Groningen',
    homeTeam: 'FC Twente',
    awayTeam: 'FC Groningen',
    date: '16 Dec',
    time: '16:45',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop',
    status: 'upcoming',
    competition: 'Eredivisie'
  },
  {
    id: '5',
    title: 'Sparta vs Heerenveen',
    homeTeam: 'Sparta Rotterdam',
    awayTeam: 'SC Heerenveen',
    date: '17 Dec',
    time: '12:15',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop',
    status: 'upcoming',
    competition: 'Eredivisie'
  },
  {
    id: '6',
    title: 'Willem II vs RKC',
    homeTeam: 'Willem II',
    awayTeam: 'RKC Waalwijk',
    date: '17 Dec',
    time: '14:30',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop',
    status: 'upcoming',
    competition: 'Eredivisie'
  }
];