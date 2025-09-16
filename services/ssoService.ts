// SSO Service for Jump API Integration
import { ApiUser } from '@/types/club';

interface IngestResponse {
  code: string;
  status: number;
  ingest: string;
  redirect_url: string;
}

interface CreateUserResponse {
  status: number;
  message: string;
  user_id: number;
}

export class SSOService {
  private static readonly SSO_BASE_URL = 'https://sso.bytomorrow.nl';
  private static readonly API_BASE_URL = 'https://api.bytomorrow.nl';
  
  // This should be stored securely on your backend, not in the frontend
  private static readonly SSO_API_KEY = 'YOUR_SSO_API_KEY'; // Replace with actual key
  private static readonly JUMP_API_KEY = 'M2U5MjgwOGE3OTQ4OTc5YjBkOTBhZmMxMTIwNmMxZTQ4NDc3N2Q4YjJhMTliYzU4NmYzNWRhNzM5MWRiOTkyNQ==';

  /**
   * Check if user exists in Jump system
   */
  static async getUserByEmail(email: string): Promise<ApiUser | null> {
    try {
      console.log('🔍 Checking if user exists:', email);
      
      const response = await fetch(`${this.API_BASE_URL}/v1/get-user?email_address=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.JUMP_API_KEY,
          'Accept': 'application/json',
        },
      });

      if (response.status === 404) {
        console.log('❌ User not found');
        return null;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      console.log('✅ User found:', userData);
      
      return userData as ApiUser;
      
    } catch (error) {
      console.error('❌ Error checking user:', error);
      return null;
    }
  }

  /**
   * Create a new user in Jump system
   */
  static async createUser(email: string, pricePlan?: number): Promise<CreateUserResponse | null> {
    try {
      console.log('🆕 Creating new user:', email);
      
      const params = new URLSearchParams({
        email_address: email,
      });
      
      if (pricePlan) {
        params.append('price_plan', pricePlan.toString());
      }

      const response = await fetch(`${this.API_BASE_URL}/v1/create-user?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': this.JUMP_API_KEY,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Create user failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ User created successfully:', result);
      
      return result as CreateUserResponse;
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }
  }

  /**
   * Create SSO ingest token for authentication
   */
  static async createIngestToken(email: string, userId?: string): Promise<IngestResponse | null> {
    try {
      console.log('🔑 Creating SSO ingest token for:', email);
      
      const params = new URLSearchParams();
      if (email) {
        params.append('email_address', email);
      }
      if (userId) {
        params.append('user_id', userId);
      }

      const response = await fetch(`${this.SSO_BASE_URL}/ingest?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': this.SSO_API_KEY, // This should be on your backend!
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ingest creation failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const ingestData = await response.json();
      console.log('✅ Ingest token created:', ingestData);
      
      return ingestData as IngestResponse;
      
    } catch (error) {
      console.error('❌ Error creating ingest token:', error);
      return null;
    }
  }

  /**
   * Complete SSO authentication flow
   */
  static async authenticateUser(email: string): Promise<{
    user: ApiUser;
    ingestToken: string;
    redirectUrl?: string;
  } | null> {
    try {
      console.log('🚀 Starting SSO authentication for:', email);

      // Step 1: Check if user exists
      let user = await this.getUserByEmail(email);
      
      if (!user) {
        console.log('👤 User not found, creating new user...');
        
        // Step 2: Create user if doesn't exist
        const createResult = await this.createUser(email);
        if (!createResult) {
          throw new Error('Failed to create user');
        }
        
        // Step 3: Get the newly created user
        user = await this.getUserByEmail(email);
        if (!user) {
          throw new Error('Failed to retrieve newly created user');
        }
      }

      // Step 4: Create ingest token for SSO
      const ingestData = await this.createIngestToken(email, user.id?.toString());
      if (!ingestData) {
        throw new Error('Failed to create ingest token');
      }

      console.log('✅ SSO authentication successful');
      
      return {
        user,
        ingestToken: ingestData.ingest,
        redirectUrl: ingestData.redirect_url,
      };
      
    } catch (error) {
      console.error('❌ SSO authentication failed:', error);
      return null;
    }
  }

  /**
   * Get user's price plans (club permissions)
   */
  static async getUserPricePlans(email: string): Promise<number[]> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return [];
      }

      // owned_price_plans contains the price plan IDs the user has access to
      return user.owned_price_plans || [];
      
    } catch (error) {
      console.error('❌ Error getting user price plans:', error);
      return [];
    }
  }

  /**
   * Assign price plan to user (club access)
   */
  static async assignPricePlan(email: string, planId: number): Promise<boolean> {
    try {
      console.log('🎫 Assigning price plan:', { email, planId });
      
      const response = await fetch(`${this.API_BASE_URL}/v1/assign-price-plan`, {
        method: 'POST',
        headers: {
          'Authorization': this.JUMP_API_KEY,
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          email_address: email,
          plan_id: planId.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Assign price plan failed:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Price plan assigned successfully:', result);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error assigning price plan:', error);
      return false;
    }
  }

  /**
   * Revoke price plan from user (remove club access)
   */
  static async revokePricePlan(email: string, planId: number): Promise<boolean> {
    try {
      console.log('🚫 Revoking price plan:', { email, planId });
      
      const response = await fetch(`${this.API_BASE_URL}/v1/revoke-price-plan`, {
        method: 'POST',
        headers: {
          'Authorization': this.JUMP_API_KEY,
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          email_address: email,
          plan_id: planId.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Revoke price plan failed:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Price plan revoked successfully:', result);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error revoking price plan:', error);
      return false;
    }
  }
}
