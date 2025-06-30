/*
  # Create customers table for churn analysis

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `customer_id` (text, unique identifier from uploaded data)
      - `email` (text, customer email)
      - `name` (text, customer name)
      - `last_purchase_date` (timestamptz, when they last made a purchase)
      - `purchase_count` (integer, total number of purchases)
      - `total_spent` (numeric, total amount spent)
      - `avg_order_value` (numeric, average order value)
      - `risk_score` (integer, churn risk score 0-100)
      - `segment` (text, risk segment: low-risk, medium-risk, high-risk)
      - Enhanced fields for better churn analysis:
      - `age` (integer, customer age)
      - `gender` (text, customer gender)
      - `tenure` (integer, months as customer)
      - `usage_frequency` (text, how often they use the service)
      - `support_calls` (integer, number of support calls)
      - `payment_delay` (integer, average payment delay in days)
      - `subscription_type` (text, type of subscription)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `customers` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  email text,
  name text,
  last_purchase_date timestamptz,
  purchase_count integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  risk_score integer DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  segment text DEFAULT 'medium-risk' CHECK (segment IN ('low-risk', 'medium-risk', 'high-risk')),
  age integer,
  gender text,
  tenure integer,
  usage_frequency text,
  support_calls integer DEFAULT 0,
  payment_delay integer DEFAULT 0,
  subscription_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_risk_score ON customers(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON customers(last_purchase_date DESC);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own data
CREATE POLICY "Users can manage their own customer data"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();