# HOA Scout 🏠

**Don't buy blind. Know your HOA before you sign.**

HOA Scout is a comprehensive HOA evaluation tool that helps homebuyers make informed decisions by aggregating public records, community sentiment, financial data, and neighborhood context powered by the Yelp Fusion API.

Built for the **Yelp AI API Hackathon** 🎉

## 🌟 Features

- **AI-Powered Analysis**: Claude AI provides nuanced analysis of HOA quality across multiple dimensions
- **Neighborhood Context**: Yelp Fusion API integration provides walkability scores and local amenity data
- **Financial Health Scoring**: Analyze reserve funds, special assessments, and budget transparency
- **Rules & Restrictions Analysis**: Understand what you're signing up for before you commit
- **Community Sentiment**: Aggregate feedback from residents and reviews
- **Actionable Insights**: Get specific questions to ask and documents to request

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **AI**: Anthropic Claude API (claude-3-5-sonnet)
- **APIs**:
  - Yelp Fusion API (neighborhood context)
  - Google Maps Geocoding API (address lookup)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- API keys for:
  - Anthropic Claude API
  - Yelp Fusion API
  - Google Maps API (optional but recommended)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hoa-scout.git
cd hoa-scout
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (takes ~2 minutes)

#### Run Database Migrations

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the migration
4. (Optional) Copy and run `supabase/seed.sql` to add demo HOAs

#### Get Your API Keys

1. Go to Project Settings → API
2. Copy your `Project URL` and `anon public` key
3. Copy the `service_role` key (keep this secret!)

### 4. Get API Keys

#### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to API Keys and create a new key
4. Copy your API key

#### Yelp Fusion API

1. Go to [yelp.com/developers](https://www.yelp.com/developers)
2. Create an app
3. Copy your API Key
4. **Note**: Free tier includes 5,000 requests/day

#### Google Maps API (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Geocoding API
4. Create credentials → API Key
5. Restrict the key to Geocoding API for security

### 5. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your keys
```

Fill in all the required values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI & APIs
ANTHROPIC_API_KEY=your_anthropic_key
YELP_API_KEY=your_yelp_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Project Structure

```
hoa-scout/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── hoa-search.js      # Search and save operations
│   │   └── analyze-hoa.js     # AI analysis pipeline
│   ├── reports/[id]/      # Dynamic HOA report pages
│   ├── search/            # Search page
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page
├── components/
│   ├── hoa-report/        # Report-specific components
│   ├── search/            # Search components
│   └── layout/            # Header, Footer
├── lib/
│   ├── apis/              # External API integrations
│   │   ├── yelp.js           # Yelp Fusion API
│   │   ├── claude.js         # Claude AI
│   │   └── geocoding.js      # Google Maps Geocoding
│   ├── supabase/          # Supabase clients
│   │   ├── client.js         # Browser client
│   │   └── server.js         # Server client
│   └── utils.js           # Utility functions
├── supabase/
│   ├── migrations/        # Database schema
│   └── seed.sql           # Demo data
├── public/                # Static assets
└── design-system/         # Design documentation

```

## 🎯 How It Works

1. **User searches** for an HOA by address or name
2. **Geocoding** converts the address to coordinates
3. **Data gathering** from multiple sources:
   - Public records (county databases)
   - Community feedback (Reddit, reviews)
   - Financial data (budgets, reserves)
   - Rules & restrictions (CC&Rs, bylaws)
4. **Yelp Integration** provides neighborhood context
5. **AI Analysis** with Claude evaluates all data
6. **Comprehensive report** is generated and cached
7. **User receives** actionable insights and recommendations

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `YELP_API_KEY`
- `GOOGLE_MAPS_API_KEY`

## 🧪 Testing

### Manual Testing

Test the app with these demo addresses (if you ran the seed script):

- `1234 Sunset Blvd, Los Angeles, CA 90028` (Sunset Heights HOA)
- `Marina del Rey, CA 90292` (Marina Vista Condominiums)
- `Las Vegas, NV 89134` (Desert Oasis Community)
- `Las Vegas, NV 89135` (Summerlin Meadows)

### API Rate Limits

- **Yelp**: 5,000 requests/day (free tier)
- **Claude**: Pay per token, ~$0.003 per 1K tokens
- **Google Maps**: $200 free credit/month

We cache Yelp data for 7 days and HOA reports for 30 days to minimize API costs.

## 📖 API Documentation

### Server Actions

#### `searchHOA(formData)`
Search for an HOA and initiate analysis if needed.

```javascript
const result = await searchHOA(formData)
// Returns: { success, hoaId, cached, data }
```

#### `getHOAById(hoaId)`
Get complete HOA data including analysis.

```javascript
const result = await getHOAById(hoaId)
// Returns: { success, data }
```

#### `saveReport(hoaId, notes)`
Save an HOA report to user's saved list (requires auth).

### External APIs

All external APIs are wrapped in `/lib/apis/` with error handling and rate limiting.

## 🎨 Design System

Complete design system documentation is available in `/design-system/`:

- `design-tokens.md` - Colors, typography, spacing
- `components.md` - Component specifications
- `responsive-breakpoints.md` - Responsive design guidelines
- `component-states.md` - Interactive states

## 🔒 Security

- **Row-Level Security**: Supabase RLS policies ensure data privacy
- **API Keys**: Never exposed to client, only used server-side
- **Input Validation**: All user inputs are sanitized
- **Rate Limiting**: API usage tracking prevents abuse

## 🐛 Troubleshooting

### "Address not found"
- Try a more specific address with street number
- Include city, state, and ZIP code
- Use the example addresses to test

### "Analysis in Progress"
- Wait 30 seconds and refresh the page
- Check browser console for errors
- Verify API keys are set correctly

### Supabase Connection Error
- Verify environment variables are set
- Check Supabase project is not paused (free tier pauses after 7 days of inactivity)
- Check RLS policies are set up correctly

### API Rate Limit Errors
- Check API usage in Supabase `api_usage` table
- Yelp: Limit is 5,000 requests/day
- Claude: Check your Anthropic account balance

## 📝 TODO / Future Features

- [ ] User authentication and saved reports
- [ ] Side-by-side HOA comparison
- [ ] Email alerts for HOA updates
- [ ] PDF report generation
- [ ] More data sources integration
- [ ] Mobile app (React Native)
- [ ] Realtor partnership program

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built for the **Yelp AI API Hackathon**
- Neighborhood data powered by **Yelp Fusion API**
- AI analysis powered by **Anthropic Claude**
- Design inspiration from Zillow, Stripe, and Linear

## 📞 Contact

For questions or feedback:
- GitHub Issues: [github.com/yourusername/hoa-scout/issues](https://github.com/yourusername/hoa-scout/issues)
- Email: your.email@example.com

---

Made with ❤️ for smart homebuyers everywhere# HOA-Scout
