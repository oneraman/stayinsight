import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced logging to verify environment variables
console.log('🔍 Supabase Environment Variables Check:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl || '❌ MISSING');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ Present (${supabaseAnonKey.length} chars)` : '❌ MISSING');

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
  const url = new URL(supabaseUrl);
  console.log('✅ Supabase URL format is valid:', url.origin);
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
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
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

// Raw fetch test to bypass Supabase client library
const testRawSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing raw Supabase REST API connection...');
    
    const apiUrl = `${supabaseUrl}/rest/v1/customers?select=count()&count=exact&limit=0`;
    console.log('📍 Testing URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    console.log('📊 Raw fetch response status:', response.status);
    console.log('📊 Raw fetch response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Raw fetch failed:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed: Invalid API key or insufficient permissions');
      } else if (response.status === 404) {
        throw new Error('Table not found: The customers table may not exist in your database');
      } else if (response.status === 0 || response.status >= 500) {
        throw new Error('Server error: Supabase service may be unavailable');
      } else {
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }
    }
    
    const responseText = await response.text();
    console.log('✅ Raw fetch successful, response:', responseText);
    return true;
    
  } catch (error) {
    console.error('❌ Raw fetch test failed:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network connectivity issue: Cannot reach Supabase servers. Check your internet connection and firewall settings.');
    }
    
    throw error;
  }
};

// Improved connection test with better diagnostics
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Starting comprehensive Supabase connection test...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 API Key present:', !!supabaseAnonKey);
    console.log('🔑 API Key length:', supabaseAnonKey?.length || 0);
    
    // Step 1: Test raw fetch first
    console.log('🔍 Step 1: Testing raw REST API connectivity...');
    await testRawSupabaseConnection();
    console.log('✅ Step 1 passed: Raw API connectivity confirmed');
    
    // Step 2: Test Supabase client library
    console.log('🔍 Step 2: Testing Supabase client library...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const { data, error, count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Supabase client query error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('relation "customers" does not exist')) {
          throw new Error('Database table "customers" does not exist. Please run the database migrations first.');
        }
        
        if (error.message?.includes('JWT')) {
          throw new Error('Authentication failed. Please check your VITE_SUPABASE_ANON_KEY.');
        }
        
        throw error;
      }
      
      console.log('✅ Step 2 passed: Supabase client library working');
      console.log('📊 Customer table accessible, count:', count);
      
      return true;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Connection timeout: Supabase is taking too long to respond. Please check your internet connection.');
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network connectivity')) {
        console.error('💡 Troubleshooting suggestions:');
        console.error('  1. Check if your Supabase project is paused (visit your Supabase dashboard)');
        console.error('  2. Verify your internet connection');
        console.error('  3. Check if there are network restrictions or firewalls blocking the connection');
        console.error('  4. Ensure your Supabase project URL is correct');
        throw new Error('Network error: Unable to connect to Supabase. Please check your internet connection and verify that your Supabase project is active.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Connection timeout: Supabase is not responding. Please check your project status and try again.');
      }
      
      if (error.message.includes('Authentication failed') || error.message.includes('Invalid API key')) {
        console.error('💡 Authentication troubleshooting:');
        console.error('  1. Check your .env file for VITE_SUPABASE_ANON_KEY');
        console.error('  2. Verify the API key in your Supabase project settings > API');
        console.error('  3. Ensure you\'re using the "anon" public key, not the service role key');
        throw new Error('Authentication error: Please verify your Supabase API key configuration.');
      }
    }
    
    throw error;
  }
};

// Helper functions for database operations with enhanced error handling
export const insertCustomers = async (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]) => {
  try {
    console.log('🔄 Inserting customers into Supabase:', customers.length);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for bulk insert
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)
      .select()
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      handleSupabaseError(error, 'insert');
    }
    
    console.log('✅ Successfully inserted customers:', data?.length || 0);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Insert operation timed out. Please try with fewer records or check your connection.');
    }
    handleSupabaseError(error, 'insertCustomers');
  }
};

export const getCustomers = async (limit = 100) => {
  try {
    console.log('🔄 Fetching customers from Supabase...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('risk_score', { ascending: false })
      .limit(limit)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      handleSupabaseError(error, 'fetch');
    }
    
    console.log('✅ Successfully fetched customers:', data?.length || 0);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch operation timed out. Please check your connection and try again.');
    }
    handleSupabaseError(error, 'getCustomers');
  }
};

export const getCustomerById = async (id: string) => {
  try {
    console.log('🔄 Fetching customer by ID:', id);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      handleSupabaseError(error, 'fetch by ID');
    }
    
    console.log('✅ Successfully fetched customer by ID');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch operation timed out. Please check your connection and try again.');
    }
    handleSupabaseError(error, 'getCustomerById');
  }
};

export const createUploadSession = async (session: Omit<UploadSession, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('🔄 Creating upload session...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const { data, error } = await supabase
      .from('upload_sessions')
      .insert(session)
      .select()
      .single()
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      handleSupabaseError(error, 'session creation');
    }
    
    console.log('✅ Successfully created upload session:', data?.id);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload session creation timed out. Please try again.');
    }
    handleSupabaseError(error, 'createUploadSession');
  }
};

export const updateUploadSession = async (id: string, updates: Partial<UploadSession>) => {
  try {
    console.log('🔄 Updating upload session:', id);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const { data, error } = await supabase
      .from('upload_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      handleSupabaseError(error, 'session update');
    }
    
    console.log('✅ Successfully updated upload session');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload session update timed out. Please try again.');
    }
    handleSupabaseError(error, 'updateUploadSession');
  }
};

// Add a function to validate environment configuration
export const validateSupabaseConfig = () => {
  const issues = [];
  
  if (!supabaseUrl) {
    issues.push('VITE_SUPABASE_URL is missing');
  } else {
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname.includes('supabase.co')) {
        issues.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
      }
    } catch {
      issues.push('VITE_SUPABASE_URL is not a valid URL format');
    }
  }
  
  if (!supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 100) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};