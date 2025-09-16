import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { Club } from '@/types/club';

export class ClubService {
  private static readonly COLLECTION_NAME = 'tenants';

  /**
   * Fetch all clubs from the clubs collection
   */
  static async getAllClubs(): Promise<Club[]> {
    try {
      console.log('=== ClubService.getAllClubs() START ===');
      console.log('Firebase configured:', isFirebaseConfigured);
      console.log('Collection name:', this.COLLECTION_NAME);
      
      if (!isFirebaseConfigured || !db) {
        throw new Error('Firebase is not properly configured. Please update config/firebase.ts with your Firebase project settings.');
      }
      
      console.log('Creating collection reference...');
      const clubsRef = collection(db, this.COLLECTION_NAME);
      console.log('Collection reference created successfully');
      
      console.log('Creating query with orderBy...');
      const q = query(clubsRef, orderBy('name', 'asc'));
      console.log('Query created successfully');
      
      console.log('Executing getDocs...');
      const querySnapshot = await getDocs(q);
      console.log('getDocs completed. Document count:', querySnapshot.size);
      
      const clubs: Club[] = [];
      
      if (querySnapshot.empty) {
        console.log('⚠️ No documents found in tenants collection');
        console.log('This could mean:');
        console.log('1. The collection is empty');
        console.log('2. Firebase rules are blocking access');
        console.log('3. The collection name is incorrect');
        return clubs;
      }
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log('📄 Processing document:', {
          id: docSnapshot.id,
          dataKeys: Object.keys(data),
          name: data.name,
          hasName: !!data.name
        });
        
        const club: Club = {
          id: docSnapshot.id,
          name: data.name || docSnapshot.id || 'Unnamed Club',
          subtitle: data.subtitle || data.name || data.displayName || 'No subtitle',
          type: data.type || data.category || data.clubType || 'Organization',
          logo: data.icon || data.logo || data.logoUrl || data.imageUrl || 'https://images.unsplash.com/photo-1606924735276-fbb5b325e933?w=200&h=200&fit=crop',
          description: data.description || data.desc,
          category: data.category || data.type,
          isActive: data.isActive !== false, // Default to true if not specified
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          jumpKey: data['jump-key'] || data.jumpKey,
          baseUrl: data.baseUrl,
        };
        
        clubs.push(club);
        console.log('✅ Added club:', club.name);
      });
      
      console.log(`🎉 Successfully fetched ${clubs.length} clubs from Firebase`);
      console.log('=== ClubService.getAllClubs() END ===');
      return clubs;
    } catch (error: any) {
      console.error('❌ Error fetching clubs from Firebase:');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Full error:', error);
      
      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied: Check Firebase security rules for the tenants collection');
      } else if (error?.code === 'unavailable') {
        throw new Error('Firebase service unavailable: Check your internet connection');
      } else if (error?.message?.includes('Firebase is not properly configured')) {
        throw error; // Re-throw configuration errors as-is
      } else {
        throw new Error(`Failed to fetch clubs: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Fetch a specific club by ID
   */
  static async getClubById(clubId: string): Promise<Club | null> {
    try {
      console.log(`Fetching club with ID: ${clubId}`);
      
      if (!isFirebaseConfigured || !db) {
        throw new Error('Firebase is not properly configured. Please update config/firebase.ts with your Firebase project settings.');
      }
      
      const clubRef = doc(db, this.COLLECTION_NAME, clubId);
      const clubSnap = await getDoc(clubRef);
      
      if (clubSnap.exists()) {
        const data = clubSnap.data();
        return {
          id: clubSnap.id,
          name: data.name || '',
          subtitle: data.subtitle || data.name || '',
          type: data.type || data.category || 'Organization',
          logo: data.icon || data.logo || data.logoUrl || 'https://images.unsplash.com/photo-1606924735276-fbb5b325e933?w=200&h=200&fit=crop',
          description: data.description,
          category: data.category,
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          jumpKey: data['jump-key'] || data.jumpKey,
          baseUrl: data.baseUrl,
        };
      } else {
        console.log(`Club with ID ${clubId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching club ${clubId}:`, error);
      throw new Error(`Failed to fetch club ${clubId}`);
    }
  }

  /**
   * Search clubs by name
   */
  static async searchClubs(searchTerm: string): Promise<Club[]> {
    try {
      console.log(`Searching clubs with term: ${searchTerm}`);
      
      const clubs = await this.getAllClubs();
      return clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching clubs:', error);
      throw new Error('Failed to search clubs');
    }
  }
}