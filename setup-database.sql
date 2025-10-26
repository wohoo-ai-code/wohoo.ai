-- wohoo.ai Waitlist Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    referral_source TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Create index on referral_source for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_source ON public.waitlist(referral_source);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.waitlist;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for the waitlist form)
-- This allows the anon key to insert new waitlist entries
CREATE POLICY "Allow public inserts" ON public.waitlist
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow service role to read all data
-- This is for your admin access and edge functions
CREATE POLICY "Service role can read all" ON public.waitlist
    FOR SELECT
    TO service_role
    USING (true);

-- Create policy to allow service role to update all data
-- This is for marking emails as sent
CREATE POLICY "Service role can update all" ON public.waitlist
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Optional: Create a view for analytics (only accessible by service_role)
CREATE OR REPLACE VIEW public.waitlist_analytics AS
SELECT
    COUNT(*) as total_signups,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as signups_last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as signups_last_7d,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as signups_last_30d,
    COUNT(DISTINCT referral_source) as unique_referral_sources,
    COUNT(*) FILTER (WHERE email_sent = true) as emails_sent,
    COUNT(*) FILTER (WHERE email_sent = false) as emails_pending
FROM public.waitlist;

-- Grant access to the view
GRANT SELECT ON public.waitlist_analytics TO service_role;

-- Create a function to get referral source breakdown
CREATE OR REPLACE FUNCTION public.get_referral_breakdown()
RETURNS TABLE (
    referral_source TEXT,
    signup_count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.referral_source,
        COUNT(*) as signup_count,
        ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.waitlist)::NUMERIC * 100), 2) as percentage
    FROM public.waitlist w
    GROUP BY w.referral_source
    ORDER BY signup_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.get_referral_breakdown() TO service_role;

-- Optional: Create a function to export waitlist as CSV (accessible via service_role)
CREATE OR REPLACE FUNCTION public.export_waitlist_csv()
RETURNS TABLE (
    name TEXT,
    email TEXT,
    phone TEXT,
    referral_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.name,
        w.email,
        w.phone,
        w.referral_source,
        w.created_at
    FROM public.waitlist w
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.export_waitlist_csv() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.waitlist IS 'Stores waitlist signups for wohoo.ai';
COMMENT ON COLUMN public.waitlist.id IS 'Unique identifier for each signup';
COMMENT ON COLUMN public.waitlist.name IS 'User full name';
COMMENT ON COLUMN public.waitlist.email IS 'User email address (unique)';
COMMENT ON COLUMN public.waitlist.phone IS 'User phone number';
COMMENT ON COLUMN public.waitlist.referral_source IS 'Where the user came from (UTM source, ref parameter, or "direct")';
COMMENT ON COLUMN public.waitlist.metadata IS 'Additional data like user agent, URL parameters, etc.';
COMMENT ON COLUMN public.waitlist.email_sent IS 'Whether the welcome email has been sent';
COMMENT ON COLUMN public.waitlist.created_at IS 'When the user signed up';
COMMENT ON COLUMN public.waitlist.updated_at IS 'When the record was last updated';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Deploy the Supabase Edge Function (see supabase/functions/send-welcome-email/)';
    RAISE NOTICE '2. Add your Supabase credentials to index.html';
    RAISE NOTICE '3. Test the waitlist form';
    RAISE NOTICE '';
    RAISE NOTICE 'To view analytics, run: SELECT * FROM waitlist_analytics;';
    RAISE NOTICE 'To view referral breakdown, run: SELECT * FROM get_referral_breakdown();';
END $$;