// Generated via Supabase MCP – do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.5" }
  public: {
    Tables: {
      accounts: {
        Row: { access_token: string | null; created_at: string | null; expires_at: number | null; id: string; id_token: string | null; provider: string; provider_account_id: string; refresh_token: string | null; scope: string | null; session_state: string | null; token_type: string | null; type: string; updated_at: string | null; user_id: string }
        Insert: { access_token?: string | null; created_at?: string | null; expires_at?: number | null; id?: string; id_token?: string | null; provider: string; provider_account_id: string; refresh_token?: string | null; scope?: string | null; session_state?: string | null; token_type?: string | null; type: string; updated_at?: string | null; user_id: string }
        Update: { access_token?: string | null; created_at?: string | null; expires_at?: number | null; id?: string; id_token?: string | null; provider?: string; provider_account_id?: string; refresh_token?: string | null; scope?: string | null; session_state?: string | null; token_type?: string | null; type?: string; updated_at?: string | null; user_id?: string }
        Relationships: [ { foreignKeyName: "fk_accounts_user_id"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] } ]
      }
      sessions: {
        Row: { created_at: string | null; expires: string; id: string; session_token: string; updated_at: string | null; user_id: string }
        Insert: { created_at?: string | null; expires: string; id?: string; session_token: string; updated_at?: string | null; user_id: string }
        Update: { created_at?: string | null; expires?: string; id?: string; session_token?: string; updated_at?: string | null; user_id?: string }
        Relationships: [ { foreignKeyName: "fk_sessions_user_id"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] } ]
      }
      users: {
        Row: { created_at: string | null; email: string; email_verified: string | null; id: string; image: string | null; name: string | null; role: string | null; school_id: string | null; updated_at: string | null }
        Insert: { created_at?: string | null; email: string; email_verified?: string | null; id?: string; image?: string | null; name?: string | null; role?: string | null; school_id?: string | null; updated_at?: string | null }
        Update: { created_at?: string | null; email?: string; email_verified?: string | null; id?: string; image?: string | null; name?: string | null; role?: string | null; school_id?: string | null; updated_at?: string | null }
        Relationships: []
      }
      verification_tokens: {
        Row: { expires: string; identifier: string; token: string }
        Insert: { expires: string; identifier: string; token: string }
        Update: { expires?: string; identifier?: string; token?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}


