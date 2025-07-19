export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          idea: string | null;
          problem: string | null;
          solution: string | null;
          value_proposition: string | null;
          target_audience: string | null;
          key_features: string | null;
          status: "draft" | "published" | "archived";
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          slug: string;
          logo_url?: string | null | undefined;
          website_url?: string | null | undefined;
          idea?: string | null;
          problem?: string | null;
          solution?: string | null;
          value_proposition?: string | null;
          target_audience?: string | null;
          key_features?: string | null;
          status?: "draft" | "published" | "archived";
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          idea?: string | null;
          problem?: string | null;
          solution?: string | null;
          value_proposition?: string | null;
          target_audience?: string | null;
          key_features?: string | null;
          status?: "draft" | "published" | "archived";
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      waitlists: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          content: Json;
          is_active: boolean;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          content?: Json;
          is_active?: boolean;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          content?: Json;
          is_active?: boolean;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist_subscribers: {
        Row: {
          id: string;
          waitlist_id: string;
          email: string;
          full_name: string | null;
          custom_data: Json;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          waitlist_id: string;
          email: string;
          full_name?: string | null;
          custom_data?: Json;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          waitlist_id?: string;
          email?: string;
          full_name?: string | null;
          custom_data?: Json;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for more convenient access
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Waitlist = Database["public"]["Tables"]["waitlists"]["Row"];
export type WaitlistSubscriber =
  Database["public"]["Tables"]["waitlist_subscribers"]["Row"];

// Custom field types
export type CustomField = {
  type: string;
  required: boolean;
  label: string;
  options?: string[];
};

export type CustomFields = {
  [key: string]: CustomField;
};

export type CustomData = {
  [key: string]: string | number | boolean | null;
};
