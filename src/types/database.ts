/**
 * Tipos de la base, escritos a mano para reflejar supabase/migrations/*.sql.
 *
 * Cuando el proyecto Supabase exista, regenerar con:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: number;
  brand_id: number;
  price: number;
  old_price: number | null;
  wholesale_price: number;
  flavors: string[];
  image_path: string | null;
  image_alt: string | null;
  is_gym: boolean;
  is_offer: boolean;
  is_out_of_stock: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CategoryRow = {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type BrandRow = {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export type SettingRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export type AdminRow = {
  user_id: string;
  email: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          category_id: number;
          brand_id: number;
          price: number;
          old_price?: number | null;
          wholesale_price: number;
          flavors?: string[];
          image_path?: string | null;
          image_alt?: string | null;
          is_gym?: boolean;
          is_offer?: boolean;
          is_out_of_stock?: boolean;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: {
          id?: number;
          slug: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      brands: {
        Row: BrandRow;
        Insert: { id?: number; slug: string; name: string; is_active?: boolean; created_at?: string };
        Update: Partial<BrandRow>;
        Relationships: [];
      };
      settings: {
        Row: SettingRow;
        Insert: { key: string; value: Json; updated_at?: string };
        Update: { key?: string; value?: Json; updated_at?: string };
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: { user_id: string; email?: string | null; created_at?: string };
        Update: Partial<AdminRow>;
        Relationships: [];
      };
    };
    Views: {
      admin_product_stats: {
        Row: { total: number; out_of_stock: number; on_offer: number; gym_line: number };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
