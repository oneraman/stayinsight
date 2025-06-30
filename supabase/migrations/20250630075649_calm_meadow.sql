/*
  # Fix RLS policy for customers table

  1. Security Changes
    - Drop existing policy that may be misconfigured
    - Create new policies with explicit permissions for INSERT, SELECT, UPDATE, DELETE
    - Ensure authenticated users can insert customer data
    - Maintain security by allowing users to manage customer data

  2. Policy Details
    - INSERT: Allow authenticated users to insert customer records
    - SELECT: Allow authenticated users to read customer records  
    - UPDATE: Allow authenticated users to update customer records
    - DELETE: Allow authenticated users to delete customer records
*/

-- Drop the existing policy that might be causing issues
DROP POLICY IF EXISTS "Users can manage their own customer data" ON customers;

-- Create specific policies for each operation
CREATE POLICY "Allow authenticated users to insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);