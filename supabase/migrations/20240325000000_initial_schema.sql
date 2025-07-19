-- Create enum for weather conditions
CREATE TYPE weather_condition AS ENUM (
  'sunny',
  'rainy',
  'cloudy',
  'snowy',
  'windy'
);

-- Create enum for temperature ranges
CREATE TYPE temperature_range AS ENUM (
  'very_cold', -- Below 0°C
  'cold',      -- 0-10°C
  'mild',      -- 10-20°C
  'warm',      -- 20-30°C
  'hot'        -- Above 30°C
);

-- Create profiles table to store user preferences
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  temperature_unit TEXT DEFAULT 'celsius',
  location_preference JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);


-- Create user saved outfits table
CREATE TABLE user_saved_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  img_url TEXT NOT NULL,
  outfit_name TEXT NOT NULL,
  description TEXT NOT NULL,
  weather_condition weather_condition NOT NULL,
  temperature_range temperature_range NOT NULL,
  outfit_items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_outfits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own saved outfits"
  ON user_saved_outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits"
  ON user_saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits"
  ON user_saved_outfits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits"
  ON user_saved_outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_recommendations_updated_at
  BEFORE UPDATE ON clothing_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_outfits_updated_at
  BEFORE UPDATE ON user_saved_outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 