-- Create bookings table to store customer booking requests
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert bookings (public form submission)
CREATE POLICY "Anyone can submit a booking" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users (admin) can view all bookings
CREATE POLICY "Authenticated users can view bookings" ON public.bookings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users (admin) can update bookings
CREATE POLICY "Authenticated users can update bookings" ON public.bookings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users (admin) can delete bookings
CREATE POLICY "Authenticated users can delete bookings" ON public.bookings
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
