export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high' | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          metric_type: string
          target_value: number
          current_value: number
          frequency: 'daily' | 'weekly' | 'monthly'
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          metric_type: string
          target_value: number
          current_value?: number
          frequency?: 'daily' | 'weekly' | 'monthly'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          metric_type?: string
          target_value?: number
          current_value?: number
          frequency?: 'daily' | 'weekly' | 'monthly'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          name: string
          description: string | null
          status: 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          name: string
          description?: string | null
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          name?: string
          description?: string | null
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_objectives: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed'
          notes: string | null
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      passwords: {
        Row: {
          id: string
          user_id: string
          encrypted_data: string
          iv: string
          salt: string
          website: string
          username: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          encrypted_data: string
          iv: string
          salt: string
          website: string
          username?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          encrypted_data?: string
          iv?: string
          salt?: string
          website?: string
          username?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          cost: number
          currency: string
          billing_cycle: 'monthly' | 'yearly' | 'quarterly'
          next_billing_date: string
          category: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          cost: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'quarterly'
          next_billing_date: string
          category?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          cost?: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'quarterly'
          next_billing_date?: string
          category?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          spent: number
          month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          amount: number
          spent?: number
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          amount?: number
          spent?: number
          month?: string
          created_at?: string
          updated_at?: string
        }
      }
      whiteboard_data: {
        Row: {
          id: string
          user_id: string
          name: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          google_event_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          attendees: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_event_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          attendees?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_event_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          attendees?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          user_id: string
          gmail_id: string
          subject: string
          from_email: string
          to_email: string
          body: string | null
          labels: string[] | null
          received_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gmail_id: string
          subject: string
          from_email: string
          to_email: string
          body?: string | null
          labels?: string[] | null
          received_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gmail_id?: string
          subject?: string
          from_email?: string
          to_email?: string
          body?: string | null
          labels?: string[] | null
          received_at?: string
          created_at?: string
        }
      }
      analytics_cache: {
        Row: {
          id: string
          user_id: string
          source: 'facebook' | 'zoom' | 'supabase'
          data: Json
          cached_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: 'facebook' | 'zoom' | 'supabase'
          data: Json
          cached_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: 'facebook' | 'zoom' | 'supabase'
          data?: Json
          cached_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
