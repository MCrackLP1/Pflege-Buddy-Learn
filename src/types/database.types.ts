export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          time_ms: number
          used_hints: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          time_ms: number
          used_hints?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          time_ms?: number
          used_hints?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_question_id_questions_id_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      choices: {
        Row: {
          id: string
          is_correct: boolean
          label: string
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          label: string
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          label?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "choices_question_id_questions_id_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          accessed_at: string
          id: string
          published_date: string | null
          question_id: string
          title: string
          url: string
        }
        Insert: {
          accessed_at?: string
          id?: string
          published_date?: string | null
          question_id: string
          title: string
          url: string
        }
        Update: {
          accessed_at?: string
          id?: string
          published_date?: string | null
          question_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "citations_question_id_questions_id_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string | null
          locale: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          display_name?: string | null
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          display_name?: string | null
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          hints_delta: number
          id: string
          pack_key: string
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hints_delta: number
          id?: string
          pack_key: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hints_delta?: number
          id?: string
          pack_key?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          difficulty: number
          explanation_md: string
          hints: Json | null
          id: string
          source_date: string | null
          source_title: string | null
          source_url: string | null
          stem: string
          topic_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          created_at?: string
          difficulty?: number
          explanation_md: string
          hints?: Json | null
          id?: string
          source_date?: string | null
          source_title?: string | null
          source_url?: string | null
          stem: string
          topic_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          created_at?: string
          difficulty?: number
          explanation_md?: string
          hints?: Json | null
          id?: string
          source_date?: string | null
          source_title?: string | null
          source_url?: string | null
          stem?: string
          topic_id?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_topics_id_fk"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          last_seen: string | null
          streak_days: number
          user_id: string
          xp: number
        }
        Insert: {
          last_seen?: string | null
          streak_days?: number
          user_id: string
          xp?: number
        }
        Update: {
          last_seen?: string | null
          streak_days?: number
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_wallet: {
        Row: {
          daily_free_hints_used: number
          daily_reset_date: string | null
          hints_balance: number
          user_id: string
        }
        Insert: {
          daily_free_hints_used?: number
          daily_reset_date?: string | null
          hints_balance?: number
          user_id: string
        }
        Update: {
          daily_free_hints_used?: number
          daily_reset_date?: string | null
          hints_balance?: number
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
      purchase_status: "pending" | "succeeded" | "failed"
      question_type: "mc" | "tf"
      user_role: "user" | "admin"
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
      purchase_status: ["pending", "succeeded", "failed"],
      question_type: ["mc", "tf"],
      user_role: ["user", "admin"],
    },
  },
} as const
