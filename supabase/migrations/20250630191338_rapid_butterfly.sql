/*
  # Create utility functions

  1. Functions
    - `update_updated_at_column()` - Updates the updated_at column to current timestamp
*/

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;