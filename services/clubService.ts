// Firebase imports disabled for iOS build
// import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
// import { db, isFirebaseConfigured } from '@/config/firebase';
import { Club } from '@/types/club';

export class ClubService {
  private static readonly COLLECTION_NAME = 'tenants';

  /**
   * Fetch all clubs from the clubs collection
   * Firebase disabled for iOS build - always throws error to use mock data
   */
  static async getAllClubs(): Promise<Club[]> {
    try {
      console.log('=== ClubService.getAllClubs() START ===');
      // Firebase disabled for build - always throw error to use mock data
      throw new Error('Firebase disabled for iOS build - using mock data');
    } catch (error: any) {
      console.error('❌ Error fetching clubs from Firebase:');
      console.error('Error message:', error?.message);
      throw new Error(`Failed to fetch clubs: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Fetch a specific club by ID
   * Firebase disabled for iOS build - always throws error to use mock data
   */
  static async getClubById(clubId: string): Promise<Club | null> {
    try {
      console.log(`Fetching club with ID: ${clubId}`);
      // Firebase disabled for build - always throw error to use mock data
      throw new Error('Firebase disabled for iOS build - using mock data');
    } catch (error) {
      console.error(`Error fetching club ${clubId}:`, error);
      throw new Error(`Failed to fetch club ${clubId}`);
    }
  }

  /**
   * Search clubs by name
   * Uses getAllClubs internally, so also disabled
   */
  static async searchClubs(searchTerm: string): Promise<Club[]> {
    try {
      console.log(`Searching clubs with term: ${searchTerm}`);
      const clubs = await this.getAllClubs(); // This will throw error
      return clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (club.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (club.type || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching clubs:', error);
      throw new Error('Failed to search clubs');
    }
  }
}