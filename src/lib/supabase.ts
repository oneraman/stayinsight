import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface CustomerRecord {
  id?: string;
  customer_id: string;
  email?: string;
  name?: string;
  last_purchase_date?: string;
  purchase_count?: number;
  total_spent?: number;
  avg_order_value?: number;
  risk_score: number;
  segment: 'low-risk' | 'medium-risk' | 'high-risk';
  age?: number;
  gender?: string;
  tenure?: number;
  usage_frequency?: string;
  support_calls?: number;
  payment_delay?: number;
  subscription_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UploadSession {
  id?: string;
  user_id: string;
  file_name: string;
  file_size: number;
  total_rows: number;
  processed_rows: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for database operations
export const insertCustomers = async (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select();
  
  if (error) throw error;
  return data;
};

export const getCustomers = async (limit = 100) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('risk_score', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

export const getCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createUploadSession = async (session: Omit<UploadSession, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('upload_sessions')
    .insert(session)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUploadSession = async (id: string, updates: Partial<UploadSession>) => {
  const { data, error } = await supabase
    .from('upload_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};