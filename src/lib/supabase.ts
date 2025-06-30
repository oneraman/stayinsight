import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://zxylftnmwajovdlwzjox.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eWxmdG5td2Fqb3ZkbHd6am94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTI4NzEsImV4cCI6MjA1MTEyODg3MX0.YLr03l_mzjGfY2Ah79XSL2Yr03l'
);

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
  user_id?: string;
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
  try {
    console.log('🔄 Inserting customers into Supabase:', customers.length);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)
      .select();
    
    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    
    console.log('✅ Successfully inserted customers:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error in insertCustomers:', error);
    throw error;
  }
};

export const getCustomers = async (limit = 100) => {
  try {
    console.log('🔄 Fetching customers from Supabase...');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('risk_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ Supabase fetch error:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched customers:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error in getCustomers:', error);
    throw error;
  }
};

export const getCustomerById = async (id: string) => {
  try {
    console.log('🔄 Fetching customer by ID:', id);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ Supabase fetch by ID error:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched customer by ID');
    return data;
  } catch (error) {
    console.error('❌ Error in getCustomerById:', error);
    throw error;
  }
};

export const createUploadSession = async (session: Omit<UploadSession, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('🔄 Creating upload session...');
    
    const { data, error } = await supabase
      .from('upload_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase session creation error:', error);
      throw error;
    }
    
    console.log('✅ Successfully created upload session:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Error in createUploadSession:', error);
    throw error;
  }
};

export const updateUploadSession = async (id: string, updates: Partial<UploadSession>) => {
  try {
    console.log('🔄 Updating upload session:', id);
    
    const { data, error } = await supabase
      .from('upload_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase session update error:', error);
      throw error;
    }
    
    console.log('✅ Successfully updated upload session');
    return data;
  } catch (error) {
    console.error('❌ Error in updateUploadSession:', error);
    throw error;
  }
};