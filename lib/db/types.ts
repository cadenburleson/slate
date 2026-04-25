export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; src: string; alt: string; caption: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "quote"; text: string }
  | { id: string; type: "divider" }
  | {
      id: string;
      type: "service";
      title: string;
      description: string;
      price: number;
      label: string;
      stripe_link: string;
    };

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string;
          owner_id: string;
          domain: string;
          sitemap_url: string | null;
          detected_platform: string | null;
          snippet_token: string;
          injection_selector: string | null;
          header_html: string | null;
          footer_html: string | null;
          stripe_account_id: string | null;
          nav_selector: string | null;
          footer_selector: string | null;
          last_seen_at: string | null;
          last_seen_referer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          domain: string;
          sitemap_url?: string | null;
          detected_platform?: string | null;
          snippet_token: string;
          injection_selector?: string | null;
          header_html?: string | null;
          footer_html?: string | null;
          stripe_account_id?: string | null;
          nav_selector?: string | null;
          footer_selector?: string | null;
          last_seen_at?: string | null;
          last_seen_referer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          domain?: string;
          sitemap_url?: string | null;
          detected_platform?: string | null;
          snippet_token?: string;
          injection_selector?: string | null;
          header_html?: string | null;
          footer_html?: string | null;
          stripe_account_id?: string | null;
          nav_selector?: string | null;
          footer_selector?: string | null;
          last_seen_at?: string | null;
          last_seen_referer?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_members: {
        Row: {
          site_id: string;
          user_id: string | null;
          role: "owner" | "editor";
          invited_email: string | null;
          invite_token: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          site_id: string;
          user_id?: string | null;
          role: "owner" | "editor";
          invited_email?: string | null;
          invite_token?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          site_id?: string;
          user_id?: string | null;
          role?: "owner" | "editor";
          invited_email?: string | null;
          invite_token?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      content_types: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          url_pattern: string;
          type: "page" | "post";
          confidence: number;
          confirmed: boolean;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          url_pattern: string;
          type: "page" | "post";
          confidence?: number;
          confirmed?: boolean;
        };
        Update: {
          id?: string;
          site_id?: string;
          name?: string;
          url_pattern?: string;
          type?: "page" | "post";
          confidence?: number;
          confirmed?: boolean;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          meta_description: string | null;
          og_image: string | null;
          content_json: Block[];
          status: "draft" | "published";
          published_at: string | null;
          show_in_nav: boolean;
          show_in_footer: boolean;
          nav_label: string | null;
          nav_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          title: string;
          meta_description?: string | null;
          og_image?: string | null;
          content_json?: Block[];
          status?: "draft" | "published";
          published_at?: string | null;
          show_in_nav?: boolean;
          show_in_footer?: boolean;
          nav_label?: string | null;
          nav_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          slug?: string;
          title?: string;
          meta_description?: string | null;
          og_image?: string | null;
          content_json?: Block[];
          status?: "draft" | "published";
          published_at?: string | null;
          show_in_nav?: boolean;
          show_in_footer?: boolean;
          nav_label?: string | null;
          nav_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          meta_description: string | null;
          og_image: string | null;
          content_json: Block[];
          tags: string[];
          author: string | null;
          status: "draft" | "published";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          title: string;
          meta_description?: string | null;
          og_image?: string | null;
          content_json?: Block[];
          tags?: string[];
          author?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          slug?: string;
          title?: string;
          meta_description?: string | null;
          og_image?: string | null;
          content_json?: Block[];
          tags?: string[];
          author?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          site_id: string;
          url: string;
          filename: string;
          size: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          url: string;
          filename: string;
          size: number;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          url?: string;
          filename?: string;
          size?: number;
          uploaded_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type SiteMember = Database["public"]["Tables"]["site_members"]["Row"];
export type ContentType = Database["public"]["Tables"]["content_types"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];
