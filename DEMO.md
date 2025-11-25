# HOA Scout - Demo Guide

This guide will help you prepare a compelling demo for the Yelp AI Hackathon judges.

## 🎯 Demo Script (5 minutes)

### 1. Problem Statement (30 seconds)

**"Buying a home is the biggest financial decision most people make, yet HOA information is scattered, incomplete, and hard to interpret. HOA Scout solves this by providing comprehensive, AI-analyzed HOA reports in seconds."**

### 2. Live Demo (3 minutes)

#### Part 1: The Search (30 seconds)

1. Open the landing page
2. Point out the clean, trustworthy design
3. Enter a demo address: `"Marina del Rey, CA 90292"`
4. Click "Get Report"

**Talk track:** *"The process starts with a simple address search. We use Google Maps Geocoding to validate the address and find the precise location."*

#### Part 2: The Report (2 minutes)

Show the generated report:

**Overall Score**
- Point to the 8.8/10 score with circular progress indicator
- Read the one-sentence summary

**Talk track:** *"Claude AI analyzes all available data and generates a comprehensive score across 5 dimensions: financial health, restrictiveness, management quality, community sentiment, and legal history."*

**Quick Verdict Section**
- Show the Red/Yellow/Green flags layout
- Point out specific examples

**Talk track:** *"We use traffic light colors for quick scanning. Red flags are deal-breakers, yellow flags need investigation, green flags are positives."*

**Yelp Integration (EMPHASIZE THIS!)**
- Scroll to the Neighborhood Context section
- Show the walkability score
- Point out the local businesses and ratings
- Show the "Powered by Yelp" badge

**Talk track:** *"Here's where Yelp's API shines. We fetch nearby businesses, calculate a walkability score, and use Claude to generate a neighborhood vibe description. This gives buyers crucial context about the lifestyle they'll have. For example, this Marina del Rey HOA has a walkability score of 8.5/10 with 47 restaurants within a mile."*

**Action Items**
- Show the "Questions to Ask" section
- Show "Documents to Request"

**Talk track:** *"Every report includes actionable next steps—specific questions to ask the HOA board and documents to request. This transforms data into decisions."*

### 3. Technical Highlights (1 minute)

**Architecture**
- Next.js 15 with Server Actions
- Supabase for database with Row-Level Security
- Anthropic Claude for AI analysis
- Yelp Fusion API for neighborhood data
- Recharts for data visualization

**Talk track:** *"We built this with production-quality architecture: Next.js 15 for performance, Supabase for data security, and Claude AI for nuanced analysis. The Yelp integration provides real-time neighborhood data that would be impossible to gather manually."*

### 4. Business Impact (30 seconds)

**Stats to mention:**
- 73 million Americans live in HOAs
- Average home price: $400,000
- Bad HOAs can cost tens of thousands in surprise assessments
- No comprehensive HOA evaluation tool currently exists

**Talk track:** *"This addresses a $400K decision that affects 73 million Americans. There's no equivalent tool on the market. Revenue potential through realtor partnerships, premium reports, and API licensing."*

## 🎨 Demo Preparation

### Before the Demo

1. **Pre-load demo HOAs** by running the seed script:
   ```bash
   # Run in Supabase SQL editor
   # Execute supabase/seed.sql
   ```

2. **Test all demo addresses**:
   - Marina del Rey, CA 90292 (highest score)
   - Los Angeles, CA 90028 (medium score)
   - Las Vegas, NV 89134 (lowest score with red flags)

3. **Clear browser cache** for fresh demo

4. **Check API limits**:
   - Yelp: 5,000 requests/day
   - Claude: Ensure sufficient credits

5. **Open demo in incognito window** to avoid cached states

### Demo Environment Setup

```bash
# 1. Ensure all services are running
npm run dev

# 2. Open these tabs before demo:
# Tab 1: Landing page (http://localhost:3000)
# Tab 2: Pre-loaded report (http://localhost:3000/reports/[marina-vista-id])
# Tab 3: Search page (http://localhost:3000/search)

# 3. Have backup: deployed Vercel URL
```

### Screen Setup

For best demo experience:
- **Display**: Use 1920x1080 or higher
- **Browser**: Chrome with dev tools closed
- **Zoom**: Set to 100% (Cmd/Ctrl + 0)
- **Dark mode**: Off (better contrast for presentations)
- **Notifications**: Turn off "Do Not Disturb"

## 📊 Key Talking Points for Yelp Integration

### Why Yelp Integration is Critical

1. **Neighborhood Context is Missing**
   - Other real estate sites show property details but not lifestyle context
   - Yelp provides the missing piece: what's it like to LIVE there?

2. **Data No One Else Has**
   - Walkability scores based on real business density
   - Recent, verified reviews of local amenities
   - Business hours, pricing, and ratings

3. **Natural Use Case**
   - Homebuyers already use Yelp to research neighborhoods
   - We bring that data into the home buying decision flow
   - One less tab to keep open while house hunting

### Unique Yelp API Features We Use

- **Business Search API**: Find all businesses within 1 mile radius
- **Category Filtering**: Restaurants, coffee, parks, grocery, etc.
- **Review Aggregation**: Star ratings and review counts
- **Distance Calculation**: Precise walkability scoring
- **Business Details**: Hours, pricing, photos

### Demo Script for Yelp Section

**"Let me show you our Yelp integration—this is where HOA Scout really shines for lifestyle assessment.**

**[Scroll to Neighborhood Context]**

**"Using Yelp's Fusion API, we analyze businesses within a 1-mile radius and calculate a walkability score. For this Marina del Rey location, you can see it's highly walkable at 8.5/10.**

**"We break down the neighborhood by category: 47 restaurants, 12 coffee shops, 5 grocery stores, and 3 parks—all with their Yelp ratings and review counts.**

**"Claude then synthesizes this data into a human-readable vibe description. Instead of just numbers, you get: 'Vibrant waterfront neighborhood with excellent walkability and diverse dining options.'"**

**"This is data you can't get anywhere else in a home buying context. We're using Yelp's API to answer the question: What's it actually like to live here?"**

## 🎬 Alternative Demo Scenarios

### Scenario 1: Quick Win (2 minutes)

Show a complete report that's already generated. Focus on:
- Score interpretation
- Yelp neighborhood context
- Actionable insights

### Scenario 2: Comparison (4 minutes)

Show two HOAs side-by-side:
- Marina Vista (8.8/10, urban, expensive)
- Desert Oasis (5.8/10, suburban, affordable)

Highlight how Yelp data differs:
- Urban: High walkability, many amenities
- Suburban: Lower walkability, car-dependent

### Scenario 3: Technical Deep-Dive (5 minutes)

For technically-minded judges:
- Show server action code
- Explain Yelp API caching strategy
- Discuss Claude prompt engineering
- Show database schema with RLS

## 🎤 Handling Questions

### Expected Questions

**Q: "How accurate is your data?"**
A: "We aggregate from multiple sources and clearly indicate confidence levels. The Yelp data is real-time and verified. For financial data, we encourage users to verify with official HOA documents."

**Q: "How do you prevent API rate limits?"**
A: "We cache Yelp data for 7 days per location and HOA reports for 30 days. This keeps us well under Yelp's 5,000 requests/day limit while providing fresh data."

**Q: "What's your monetization strategy?"**
A: "Freemium model: basic reports free, premium features like PDF downloads and comparisons require subscription. Revenue opportunities through realtor partnerships and API licensing."

**Q: "How is this different from Zillow or Redfin?"**
A: "They show property details, we show HOA quality and neighborhood lifestyle context. We're complementary—used in conjunction with those platforms."

**Q: "Why use Claude vs other LLMs?"**
A: "Claude excels at nuanced analysis and following complex instructions. The prompt engineering required for HOA evaluation benefits from Claude's long context window and reasoning capabilities."

## 📈 Success Metrics to Share

- **Speed**: Reports generated in ~30 seconds
- **Completeness**: 5 data dimensions analyzed
- **Actionability**: 5-10 specific questions and document requests
- **Uniqueness**: Only tool combining HOA analysis with neighborhood context
- **Scalability**: Architecture supports thousands of requests/day

## 🎁 Backup Plans

### If Live Demo Fails

1. **Use pre-recorded video** (record a perfect run beforehand)
2. **Show deployed Vercel URL** as backup
3. **Walk through screenshots** in a slide deck

### If API Fails

1. **Show cached reports** (pre-generated)
2. **Explain architecture** and how APIs integrate
3. **Show code examples** instead of live execution

## 🏆 Winning the Demo

### Key Success Factors

1. **Show Yelp Value Immediately** - Make the Yelp integration obvious and impactful
2. **Emphasize Real Problem** - This solves a $400K decision
3. **Demonstrate Polish** - The UI is production-ready
4. **Be Enthusiastic** - Show passion for helping homebuyers
5. **Know Your Tech** - Be ready for technical questions

### Memorable Closing

**"HOA Scout transforms the home buying process from guesswork to informed decision-making. By combining public records, AI analysis, and Yelp's rich neighborhood data, we're giving buyers the complete picture—something that simply doesn't exist today. Thank you!"**

---

**You've got this! 🚀 Good luck with your demo!**