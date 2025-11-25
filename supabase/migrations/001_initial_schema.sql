-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- HOA Profiles table
CREATE TABLE hoa_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoa_name TEXT NOT NULL,

  -- Location data
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  coordinates JSONB, -- {lat, lng}

  -- Basic info
  monthly_fee NUMERIC,
  annual_budget NUMERIC,
  total_units INTEGER,
  year_established INTEGER,
  management_company TEXT,

  -- Aggregated scores (computed by AI)
  overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 10),
  financial_health_score NUMERIC CHECK (financial_health_score >= 0 AND financial_health_score <= 10),
  restrictiveness_score NUMERIC CHECK (restrictiveness_score >= 0 AND restrictiveness_score <= 10),
  management_quality_score NUMERIC CHECK (management_quality_score >= 0 AND management_quality_score <= 10),
  community_sentiment_score NUMERIC CHECK (community_sentiment_score >= 0 AND community_sentiment_score <= 10),

  -- Summary from AI
  one_sentence_summary TEXT,

  -- Raw data sources (JSONB for flexibility)
  public_records JSONB,
  community_feedback JSONB,
  financial_data JSONB,
  rules_data JSONB,
  ai_analysis JSONB, -- Full Claude analysis

  -- Flags from analysis
  red_flags JSONB DEFAULT '[]'::JSONB,
  yellow_flags JSONB DEFAULT '[]'::JSONB,
  green_flags JSONB DEFAULT '[]'::JSONB,

  -- Questions and documents from AI
  questions_to_ask JSONB DEFAULT '[]'::JSONB,
  documents_to_request JSONB DEFAULT '[]'::JSONB,

  -- Metadata
  data_completeness NUMERIC DEFAULT 0, -- 0-100% how complete our data is
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_hoa_location UNIQUE(hoa_name, city, state)
);

-- Create indexes for performance
CREATE INDEX idx_hoa_location ON hoa_profiles(city, state, zip_code);
CREATE INDEX idx_hoa_score ON hoa_profiles(overall_score DESC NULLS LAST);
CREATE INDEX idx_hoa_updated ON hoa_profiles(last_updated DESC);

-- Neighborhood Context (cached Yelp data)
CREATE TABLE neighborhood_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hoa_id UUID REFERENCES hoa_profiles(id) ON DELETE CASCADE,

  -- Location for this neighborhood data
  location JSONB NOT NULL, -- {lat, lng, radius}
  city TEXT NOT NULL,
  state TEXT NOT NULL,

  -- Yelp data (cached)
  businesses JSONB, -- Categorized businesses nearby
  walkability_score NUMERIC,
  restaurant_count INTEGER,
  parks_count INTEGER,
  grocery_count INTEGER,
  coffee_count INTEGER,
  overall_vibe TEXT, -- AI-generated summary from Yelp data

  -- Cache metadata
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  CONSTRAINT unique_neighborhood UNIQUE(city, state, location)
);

CREATE INDEX idx_neighborhood_expiry ON neighborhood_context(expires_at);
CREATE INDEX idx_neighborhood_hoa ON neighborhood_context(hoa_id);

-- User Searches (track what users searched for)
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hoa_id UUID REFERENCES hoa_profiles(id),

  search_query TEXT NOT NULL,
  search_address TEXT,
  search_timestamp TIMESTAMPTZ DEFAULT NOW(),
  search_result_status TEXT CHECK (search_result_status IN ('found', 'not_found', 'error', 'processing')),

  -- Analytics data
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Follow-up data (for product improvement)
  proceeded_with_purchase BOOLEAN,
  user_feedback TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_timestamp TIMESTAMPTZ
);

CREATE INDEX idx_user_searches_user ON user_searches(user_id);
CREATE INDEX idx_user_searches_timestamp ON user_searches(search_timestamp DESC);
CREATE INDEX idx_user_searches_hoa ON user_searches(hoa_id);

-- Saved Reports (users can save/favorite reports)
CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hoa_id UUID REFERENCES hoa_profiles(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],

  CONSTRAINT unique_user_hoa UNIQUE(user_id, hoa_id)
);

CREATE INDEX idx_saved_reports_user ON saved_reports(user_id);
CREATE INDEX idx_saved_reports_saved_at ON saved_reports(saved_at DESC);

-- Processing Queue (for background jobs)
CREATE TABLE processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL CHECK (job_type IN ('analyze_hoa', 'update_neighborhood', 'refresh_data')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Job data
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

CREATE INDEX idx_processing_queue_status ON processing_queue(status, created_at);
CREATE INDEX idx_processing_queue_type ON processing_queue(job_type, status);

-- API Usage Tracking (for rate limiting and cost monitoring)
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_name TEXT NOT NULL CHECK (api_name IN ('yelp', 'claude', 'google_maps', 'reddit')),

  -- Usage details
  endpoint TEXT,
  request_count INTEGER DEFAULT 1,
  tokens_used INTEGER, -- For Claude API
  cost_estimate NUMERIC, -- Estimated cost in USD

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT
);

CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp DESC);
CREATE INDEX idx_api_usage_user ON api_usage(user_id);
CREATE INDEX idx_api_usage_api ON api_usage(api_name, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE hoa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- HOA profiles are publicly readable
CREATE POLICY "HOA profiles are publicly readable" ON hoa_profiles
  FOR SELECT USING (true);

-- Only service role can insert/update HOA profiles
CREATE POLICY "Service role can manage HOA profiles" ON hoa_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Neighborhood context is publicly readable
CREATE POLICY "Neighborhood context is publicly readable" ON neighborhood_context
  FOR SELECT USING (true);

-- Only service role can manage neighborhood context
CREATE POLICY "Service role can manage neighborhood context" ON neighborhood_context
  FOR ALL USING (auth.role() = 'service_role');

-- Users can only see their own searches
CREATE POLICY "Users can view own searches" ON user_searches
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can insert own searches" ON user_searches
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update own searches" ON user_searches
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

-- Users can manage their own saved reports
CREATE POLICY "Users can manage own saved reports" ON saved_reports
  FOR ALL USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

-- Only service role can access processing queue
CREATE POLICY "Service role manages processing queue" ON processing_queue
  FOR ALL USING (auth.role() = 'service_role');

-- API usage policies
CREATE POLICY "Users can view own API usage" ON api_usage
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Service role can manage API usage" ON api_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Create functions for common operations

-- Function to update HOA scores
CREATE OR REPLACE FUNCTION update_hoa_scores(
  p_hoa_id UUID,
  p_overall NUMERIC,
  p_financial NUMERIC,
  p_restrictiveness NUMERIC,
  p_management NUMERIC,
  p_community NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE hoa_profiles
  SET
    overall_score = p_overall,
    financial_health_score = p_financial,
    restrictiveness_score = p_restrictiveness,
    management_quality_score = p_management,
    community_sentiment_score = p_community,
    last_updated = NOW()
  WHERE id = p_hoa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache() RETURNS void AS $$
BEGIN
  DELETE FROM neighborhood_context
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hoa_profiles_updated_at BEFORE UPDATE ON hoa_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();