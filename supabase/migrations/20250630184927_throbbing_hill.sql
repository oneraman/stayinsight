/*
  # Create Update Functions

  1. New Functions
    - `update_updated_at_column()`: Updates the `updated_at` column to the current timestamp
  2. Security
    - No security changes
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;