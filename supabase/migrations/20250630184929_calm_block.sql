/*
  # Create Customers Table

  1. New Tables
    - `customers`: Stores customer data for churn analysis
      - `id` (uuid, primary key)
      - `customer_id` (text, not null)
      - `email` (text)
      - `name` (text)
      - `last_purchase_date` (timestamptz)
      - `purchase_count` (integer)
      - `total_spent` (numeric)
      - `avg_order_value` (numeric)
      - `risk_score` (integer)
      - `segment` (text)
      - `age` (integer)
      - `gender` (text)
      - `tenure` (integer)
      - `usage_frequency` (text)
      - `support_calls` (integer)
      - `payment_delay` (integer)
      - `subscription_type` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `customers` table
    - Add policies for authenticated users to manage their own customers
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  email text,
  name text,
  last_purchase_date timestamptz,
  purchase_count integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  risk_score integer DEFAULT 50,
  segment text DEFAULT 'medium-risk',
  age integer,
  gender text,
  tenure integer,
  usage_frequency text,
  support_calls integer DEFAULT 0,
  payment_delay integer DEFAULT 0,
  subscription_type text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT customers_risk_score_check CHECK ((risk_score >= 0) AND (risk_score <= 100)),
  CONSTRAINT customers_segment_check CHECK (segment = ANY (ARRAY['low-risk'::text, 'medium-risk'::text, 'high-risk'::text]))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON public.customers USING btree (customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers USING btree (email);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON public.customers USING btree (last_purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_risk_score ON public.customers USING btree (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON public.customers USING btree (segment);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers USING btree (user_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();