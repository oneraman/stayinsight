import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with better error messages
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase Configuration Error:');
  console.error('Missing environment variables:');
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
  console.error('Please check your .env file and ensure both variables are set correctly.');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

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

// Enhanced error handling helper
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Supabase ${operation} error:`, error);
  
  // Check for network connectivity issues
  if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
    throw new Error(`Network error: Unable to connect to Supabase. Please check your internet connection and verify that your Supabase project is active.`);
  }
  
  // Check for authentication issues
  if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
    throw new Error(`Authentication error: Invalid Supabase API key. Please verify your VITE_SUPABASE_ANON_KEY in the .env file.`);
  }
  
  // Check for database schema issues
  if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
    throw new Error(`Database error: Required table does not exist. Please ensure your database schema is properly set up.`);
  }
  
  // Check for CORS issues
  if (error.message?.includes('CORS')) {
    throw new Error(`CORS error: Cross-origin request blocked. Please check your Supabase project settings.`);
  }
  
  throw error;
};

// Test connection helper with improved error handling
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 API Key present:', !!supabaseAnonKey);
    
    // First, try a simple health check
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      handleSupabaseError(error, 'connection test');
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        console.error('💡 Suggestion: Check if your Supabase project is paused or if there are network restrictions');
      }
    }
    
    return false;
  }
};

// Helper functions for database operations with enhanced error handling
export const insertCustomers = async (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]) => {
  try {
    console.log('🔄 Inserting customers into Supabase:', customers.length);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)
      .select();
    
    if (error) {
      handleSupabaseError(error, 'insert');
    }
    
    console.log('✅ Successfully inserted customers:', data?.length || 0);
    return data;
  } catch (error) {
    handleSupabaseError(error, 'insertCustomers');
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
      handleSupabaseError(error, 'fetch');
    }
    
    console.log('✅ Successfully fetched customers:', data?.length || 0);
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getCustomers');
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
      handleSupabaseError(error, 'fetch by ID');
    }
    
    console.log('✅ Successfully fetched customer by ID');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getCustomerById');
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
      handleSupabaseError(error, 'session creation');
    }
    
    console.log('✅ Successfully created upload session:', data?.id);
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createUploadSession');
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
      handleSupabaseError(error, 'session update');
    }
    
    console.log('✅ Successfully updated upload session');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'updateUploadSession');
  }
};