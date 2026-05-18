export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          user_type: 'brand' | 'affiliate'
          first_name: string | null
          last_name: string | null
          company_name: string | null
          profile_picture_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          user_type: 'brand' | 'affiliate'
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          profile_picture_url?: string | null
          bio?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          profile_picture_url?: string | null
          bio?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string | null
          category: string | null
          launch_date: string | null
          end_date: string | null
          budget_amount: number | null
          commission_rate: number
          target_audience: string | null
          campaign_url: string | null
          promotional_materials: string | null
          status: 'draft' | 'active' | 'paused' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          title: string
          description?: string | null
          category?: string | null
          launch_date?: string | null
          end_date?: string | null
          budget_amount?: number | null
          commission_rate?: number
          target_audience?: string | null
          campaign_url?: string | null
          promotional_materials?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
        }
        Update: Partial<{
          title: string
          description: string | null
          // add more as needed
        }>
      }
      // You can expand other tables later
    }
  }
}