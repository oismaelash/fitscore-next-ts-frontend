import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          performance: {
            experience: string;
            deliveries: string;
            skills: string[];
          };
          energy: {
            availability: string;
            deadlines: string;
            pressure: string;
          };
          culture: {
            legalValues: string[];
          };
          application_link: string;
          status: 'draft' | 'published' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          performance: {
            experience: string;
            deliveries: string;
            skills: string[];
          };
          energy: {
            availability: string;
            deadlines: string;
            pressure: string;
          };
          culture: {
            legalValues: string[];
          };
          application_link: string;
          status?: 'draft' | 'published' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          performance?: {
            experience: string;
            deliveries: string;
            skills: string[];
          };
          energy?: {
            availability: string;
            deadlines: string;
            pressure: string;
          };
          culture?: {
            legalValues: string[];
          };
          application_link?: string;
          status?: 'draft' | 'published' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          phone: string;
          resume_url: string;
          cultural_fit: {
            performance: string;
            energy: string;
            culture: string;
          };
          status: 'new' | 'reviewed' | 'sent_to_manager';
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          name: string;
          email: string;
          phone: string;
          resume_url: string;
          cultural_fit: {
            performance: string;
            energy: string;
            culture: string;
          };
          status?: 'new' | 'reviewed' | 'sent_to_manager';
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          resume_url?: string;
          cultural_fit?: {
            performance: string;
            energy: string;
            culture: string;
          };
          status?: 'new' | 'reviewed' | 'sent_to_manager';
          created_at?: string;
        };
      };
      fit_scores: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          technical_score: number;
          cultural_score: number;
          behavioral_score: number;
          overall_score: number;
          ai_analysis: string;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          technical_score: number;
          cultural_score: number;
          behavioral_score: number;
          overall_score: number;
          ai_analysis: string;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          technical_score?: number;
          cultural_score?: number;
          behavioral_score?: number;
          overall_score?: number;
          ai_analysis?: string;
          calculated_at?: string;
        };
      };
    };
  };
}

export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export type Candidate = Database['public']['Tables']['candidates']['Row'];
export type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
export type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export type FitScore = Database['public']['Tables']['fit_scores']['Row'];
export type FitScoreInsert = Database['public']['Tables']['fit_scores']['Insert'];
export type FitScoreUpdate = Database['public']['Tables']['fit_scores']['Update'];
