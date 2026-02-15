/**
 * Hand-written types matching the Supabase schema.
 * Can be replaced with auto-generated types later via:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          marketing_consent: boolean
          consent_timestamp: string | null
          current_streak: number
          last_played_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          marketing_consent?: boolean
          consent_timestamp?: string | null
          current_streak?: number
          last_played_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          marketing_consent?: boolean
          consent_timestamp?: string | null
          current_streak?: number
          last_played_date?: string | null
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: number
          user_id: string
          game_date: string
          predicted_price: number
          guess_number: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          game_date: string
          predicted_price: number
          guess_number?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          game_date?: string
          predicted_price?: number
          guess_number?: number
          created_at?: string
        }
      }
      daily_results: {
        Row: {
          game_date: string
          target_hour: number
          target_minute: number
          actual_price: number | null
          recorded_at: string | null
          created_at: string
        }
        Insert: {
          game_date: string
          target_hour: number
          target_minute: number
          actual_price?: number | null
          recorded_at?: string | null
          created_at?: string
        }
        Update: {
          game_date?: string
          target_hour?: number
          target_minute?: number
          actual_price?: number | null
          recorded_at?: string | null
          created_at?: string
        }
      }
      winners: {
        Row: {
          id: number
          game_date: string
          user_id: string
          prediction_id: number
          predicted_price: number
          actual_price: number
          difference: number
          accuracy: number
          prize_tier: string
          prize_share: number | null
          tx_id: string | null
          tx_url: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          game_date: string
          user_id: string
          prediction_id: number
          predicted_price: number
          actual_price: number
          difference: number
          accuracy: number
          prize_tier: string
          prize_share?: number | null
          tx_id?: string | null
          tx_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          game_date?: string
          user_id?: string
          prediction_id?: number
          predicted_price?: number
          actual_price?: number
          difference?: number
          accuracy?: number
          prize_tier?: string
          prize_share?: number | null
          tx_id?: string | null
          tx_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      page_views: {
        Row: {
          id: number
          page: string
          user_id: string | null
          referrer: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: number
          page: string
          user_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          page?: string
          user_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      bonus_unlocks: {
        Row: {
          id: number
          user_id: string
          game_date: string
          platform: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          game_date: string
          platform?: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          game_date?: string
          platform?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
