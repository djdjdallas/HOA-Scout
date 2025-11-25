-- Sample HOA data for demo purposes
-- These are fictional HOAs based on real patterns for Los Angeles and Las Vegas areas

-- Los Angeles Area HOAs
INSERT INTO hoa_profiles (
  hoa_name,
  address,
  city,
  state,
  zip_code,
  coordinates,
  monthly_fee,
  annual_budget,
  total_units,
  year_established,
  management_company,
  overall_score,
  financial_health_score,
  restrictiveness_score,
  management_quality_score,
  community_sentiment_score,
  one_sentence_summary,
  red_flags,
  yellow_flags,
  green_flags,
  questions_to_ask,
  documents_to_request,
  data_completeness
) VALUES
(
  'Sunset Heights HOA',
  '1234 Sunset Blvd',
  'Los Angeles',
  'CA',
  '90028',
  '{"lat": 34.0522, "lng": -118.2437}'::JSONB,
  450,
  1800000,
  200,
  1998,
  'Premier Property Management LLC',
  7.2,
  8.5,
  6.0,
  7.5,
  7.0,
  'Financially stable HOA with moderate restrictions and generally responsive management, but some concerns about parking enforcement.',
  '[
    {"title": "Limited Guest Parking", "description": "Only 2 guest spots for 200 units, strictly enforced", "severity": "moderate"},
    {"title": "No Street Parking After 10pm", "description": "Immediate towing enforced", "severity": "high"}
  ]'::JSONB,
  '[
    {"title": "Rising Monthly Fees", "description": "15% increase over past 2 years", "severity": "low"},
    {"title": "Aging Infrastructure", "description": "Pool and gym equipment need updates", "severity": "moderate"}
  ]'::JSONB,
  '[
    {"title": "Fully Funded Reserves", "description": "120% of recommended reserve level", "severity": "positive"},
    {"title": "Active Community", "description": "Monthly events and high participation", "severity": "positive"},
    {"title": "Transparent Finances", "description": "Quarterly reports published online", "severity": "positive"}
  ]'::JSONB,
  '["Current reserve fund percentage?", "Any planned special assessments?", "Delinquency rate on dues?", "Pet policy details?", "Rental restrictions?"]'::JSONB,
  '["CC&Rs", "Last 2 years financial statements", "Reserve study", "Meeting minutes (6 months)", "Insurance declarations"]'::JSONB,
  85
),
(
  'Marina Vista Condominiums',
  '5678 Marina Way',
  'Marina del Rey',
  'CA',
  '90292',
  '{"lat": 33.9802, "lng": -118.4518}'::JSONB,
  680,
  3200000,
  350,
  2005,
  'Coastal Management Group',
  8.8,
  9.2,
  7.5,
  8.5,
  9.0,
  'Premium waterfront HOA with excellent financials and professional management, though fees reflect the high-end amenities.',
  '[]'::JSONB,
  '[
    {"title": "High Monthly Fees", "description": "$680/month is above area average", "severity": "low"},
    {"title": "Strict Architectural Guidelines", "description": "All modifications require board approval", "severity": "moderate"}
  ]'::JSONB,
  '[
    {"title": "Resort-Style Amenities", "description": "Pool, spa, gym, and private beach access", "severity": "positive"},
    {"title": "Strong Reserves", "description": "150% funded with investment strategy", "severity": "positive"},
    {"title": "Professional Management", "description": "24/7 concierge and maintenance", "severity": "positive"},
    {"title": "High Property Values", "description": "Consistent appreciation above market", "severity": "positive"}
  ]'::JSONB,
  '["Upcoming capital improvements?", "Owner vs rental ratio?", "Average time to sell units?", "Noise policies?", "Marina slip availability?"]'::JSONB,
  '["CC&Rs", "Financial audit reports", "Reserve study", "Architectural guidelines", "Marina rules"]'::JSONB,
  92
),

-- Las Vegas Area HOAs
(
  'Desert Oasis Community',
  '9012 Desert Palm Dr',
  'Las Vegas',
  'NV',
  '89134',
  '{"lat": 36.1699, "lng": -115.1398}'::JSONB,
  195,
  980000,
  180,
  2012,
  'Nevada Community Partners',
  5.8,
  6.5,
  8.0,
  5.0,
  5.5,
  'Affordable HOA with concerning management responsiveness and very strict rules, particularly regarding landscaping and home modifications.',
  '[
    {"title": "Excessive Fines", "description": "$100 fine for trash cans visible after 6pm", "severity": "high"},
    {"title": "Poor Communication", "description": "Board rarely responds to owner concerns", "severity": "high"},
    {"title": "Lawsuit Pending", "description": "Discrimination lawsuit filed by homeowner", "severity": "high"}
  ]'::JSONB,
  '[
    {"title": "Underfunded Reserves", "description": "Only 45% of recommended level", "severity": "high"},
    {"title": "High Violation Rate", "description": "30% of homes received violations last year", "severity": "moderate"}
  ]'::JSONB,
  '[
    {"title": "Low Monthly Fees", "description": "$195 is below average for area", "severity": "positive"},
    {"title": "Nice Common Areas", "description": "Well-maintained parks and playgrounds", "severity": "positive"}
  ]'::JSONB,
  '["Details about pending lawsuit?", "Why are reserves so low?", "Board election process?", "Fine appeal process?", "Management company contract terms?"]'::JSONB,
  '["CC&Rs", "Violation history", "Legal documents regarding lawsuit", "Reserve study", "Board meeting recordings"]'::JSONB,
  78
),
(
  'Summerlin Meadows',
  '3456 Meadow Lane',
  'Las Vegas',
  'NV',
  '89135',
  '{"lat": 36.1672, "lng": -115.3310}'::JSONB,
  320,
  2100000,
  420,
  2008,
  'FirstService Residential',
  8.2,
  8.8,
  6.5,
  8.0,
  8.5,
  'Well-run master-planned community with strong financials and amenities, moderate restrictions, and engaged residents.',
  '[]'::JSONB,
  '[
    {"title": "Special Assessment Possible", "description": "Discussing $2000 assessment for gate repairs", "severity": "moderate"},
    {"title": "Pool Hours Limited", "description": "Pool closes at 8pm year-round", "severity": "low"}
  ]'::JSONB,
  '[
    {"title": "Excellent Amenities", "description": "3 pools, tennis courts, fitness center", "severity": "positive"},
    {"title": "Strong Community", "description": "Active social committee and events", "severity": "positive"},
    {"title": "Good Schools Nearby", "description": "Top-rated elementary and middle schools", "severity": "positive"},
    {"title": "Stable Fees", "description": "Only 2% annual increases for 5 years", "severity": "positive"}
  ]'::JSONB,
  '["Gate repair assessment timeline?", "Guest access procedures?", "RV parking availability?", "Solar panel policies?", "Landscape modification rules?"]'::JSONB,
  '["CC&Rs", "Proposed assessment details", "Financial statements", "Amenity schedules", "Architectural guidelines"]'::JSONB,
  88
),

-- Additional test HOA with minimal data (for testing incomplete data scenarios)
(
  'Valley View Estates',
  '7890 Valley View Rd',
  'Henderson',
  'NV',
  '89052',
  '{"lat": 36.0395, "lng": -114.9817}'::JSONB,
  275,
  NULL,
  150,
  2003,
  'Self-Managed',
  6.5,
  7.0,
  7.0,
  6.0,
  6.0,
  'Self-managed HOA with limited available data, appears to have average performance across most metrics but transparency is concerning.',
  '[
    {"title": "Limited Financial Transparency", "description": "No published financial statements", "severity": "high"}
  ]'::JSONB,
  '[
    {"title": "Self-Managed", "description": "No professional management company", "severity": "moderate"},
    {"title": "Incomplete Records", "description": "Many documents not available online", "severity": "moderate"}
  ]'::JSONB,
  '[
    {"title": "Reasonable Fees", "description": "$275/month for area and amenities", "severity": "positive"},
    {"title": "Low Complaint Volume", "description": "Few complaints on community forums", "severity": "positive"}
  ]'::JSONB,
  '["Who manages day-to-day operations?", "How are financial records maintained?", "Board member experience?", "How are vendors selected?", "Emergency fund status?"]'::JSONB,
  '["All financial records", "Board member bios", "Vendor contracts", "HOA formation documents", "Meeting minutes"]'::JSONB,
  45
);

-- Sample neighborhood context for Sunset Heights (Los Angeles)
INSERT INTO neighborhood_context (
  hoa_id,
  location,
  city,
  state,
  businesses,
  walkability_score,
  restaurant_count,
  parks_count,
  grocery_count,
  coffee_count,
  overall_vibe
) VALUES (
  (SELECT id FROM hoa_profiles WHERE hoa_name = 'Sunset Heights HOA'),
  '{"lat": 34.0522, "lng": -118.2437, "radius": 1609}'::JSONB,
  'Los Angeles',
  'CA',
  '[
    {
      "category": "restaurants",
      "count": 47,
      "topRated": [
        {"name": "The Hollywood Canteen", "rating": 4.5, "reviewCount": 234},
        {"name": "Sunset Grill", "rating": 4.3, "reviewCount": 189},
        {"name": "LA Tacos", "rating": 4.7, "reviewCount": 567}
      ]
    },
    {
      "category": "coffee",
      "count": 12,
      "topRated": [
        {"name": "Blue Bottle Coffee", "rating": 4.4, "reviewCount": 445},
        {"name": "Alfred Coffee", "rating": 4.2, "reviewCount": 321}
      ]
    },
    {
      "category": "grocery",
      "count": 5,
      "topRated": [
        {"name": "Trader Joes", "rating": 4.5, "reviewCount": 234},
        {"name": "Whole Foods", "rating": 4.1, "reviewCount": 178}
      ]
    }
  ]'::JSONB,
  8.5,
  47,
  3,
  5,
  12,
  'Vibrant urban neighborhood with excellent walkability and diverse dining options. Young professional atmosphere with trendy coffee shops and active nightlife.'
);

-- Sample user search (anonymous for demo)
INSERT INTO user_searches (
  user_id,
  hoa_id,
  search_query,
  search_address,
  search_result_status
) VALUES (
  NULL,
  (SELECT id FROM hoa_profiles WHERE hoa_name = 'Sunset Heights HOA'),
  'Sunset Heights HOA Los Angeles',
  '1234 Sunset Blvd, Los Angeles, CA 90028',
  'found'
);