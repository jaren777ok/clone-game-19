export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blotato_accounts: {
        Row: {
          api_key_encrypted: string
          created_at: string
          facebook_account_id: string | null
          facebook_page_id: string | null
          id: string
          instagram_account_id: string | null
          tiktok_account_id: string | null
          updated_at: string
          user_id: string
          youtube_account_id: string | null
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          facebook_account_id?: string | null
          facebook_page_id?: string | null
          id?: string
          instagram_account_id?: string | null
          tiktok_account_id?: string | null
          updated_at?: string
          user_id: string
          youtube_account_id?: string | null
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          facebook_account_id?: string | null
          facebook_page_id?: string | null
          id?: string
          instagram_account_id?: string | null
          tiktok_account_id?: string | null
          updated_at?: string
          user_id?: string
          youtube_account_id?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_videos: {
        Row: {
          created_at: string
          id: string
          request_id: string | null
          script: string
          title: string | null
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id?: string | null
          script: string
          title?: string | null
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string | null
          script?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      heygen_api_keys: {
        Row: {
          api_key_encrypted: string
          api_key_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          api_key_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          api_key_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          id: string
          images: Json | null
          role: string
          timestamp: string
        }
        Insert: {
          chat_id: string
          content: string
          id?: string
          images?: Json | null
          role: string
          timestamp?: string
        }
        Update: {
          chat_id?: string
          content?: string
          id?: string
          images?: Json | null
          role?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_clonegame: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      user_video_configs: {
        Row: {
          api_key_id: string | null
          avatar_data: Json | null
          card_customization: Json | null
          created_at: string
          current_step: string
          generated_script: string | null
          id: string
          manual_customization: Json | null
          presenter_customization: Json | null
          second_avatar_data: Json | null
          style_data: Json | null
          subtitle_customization: Json | null
          updated_at: string
          user_id: string
          voice_data: Json | null
        }
        Insert: {
          api_key_id?: string | null
          avatar_data?: Json | null
          card_customization?: Json | null
          created_at?: string
          current_step?: string
          generated_script?: string | null
          id?: string
          manual_customization?: Json | null
          presenter_customization?: Json | null
          second_avatar_data?: Json | null
          style_data?: Json | null
          subtitle_customization?: Json | null
          updated_at?: string
          user_id: string
          voice_data?: Json | null
        }
        Update: {
          api_key_id?: string | null
          avatar_data?: Json | null
          card_customization?: Json | null
          created_at?: string
          current_step?: string
          generated_script?: string | null
          id?: string
          manual_customization?: Json | null
          presenter_customization?: Json | null
          second_avatar_data?: Json | null
          style_data?: Json | null
          subtitle_customization?: Json | null
          updated_at?: string
          user_id?: string
          voice_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_video_configs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "heygen_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      video_generation_tracking: {
        Row: {
          created_at: string
          id: string
          last_check_time: string
          request_id: string
          script: string
          start_time: string
          status: Database["public"]["Enums"]["video_generation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_check_time?: string
          request_id: string
          script: string
          start_time?: string
          status?: Database["public"]["Enums"]["video_generation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_check_time?: string
          request_id?: string
          script?: string
          start_time?: string
          status?: Database["public"]["Enums"]["video_generation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      video_generation_status: "processing" | "completed" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      video_generation_status: ["processing", "completed", "expired"],
    },
  },
} as const
