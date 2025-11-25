# Claude Code Memory - HOAscout

## Anthropic Claude API Models (Updated November 2025)

### Current Valid Models

| Model | API ID | Pricing (input/output) | Use Case |
|-------|--------|------------------------|----------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | $3/$15 per 1M tokens | Complex analysis, coding |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | $1/$5 per 1M tokens | Fast, low-cost tasks |
| Claude Opus 4.5 | `claude-opus-4-5-20251023` | $15/$75 per 1M tokens | Most capable |

### Model Aliases (auto-update to latest)
- `claude-sonnet-4-5` → latest Sonnet 4.5
- `claude-haiku-4-5` → latest Haiku 4.5
- `claude-opus-4-5` → latest Opus 4.5

### Deprecated/Retired Models (DO NOT USE)
- `claude-3-5-sonnet-20241022` - Retired, returns 404
- `claude-3-opus-20240229` - Deprecated June 2025
- `claude-3-sonnet-20240229` - Retired July 2025

### This Project Uses
- **Model**: `claude-sonnet-4-5-20250929`
- **File**: `lib/apis/claude.js`
- **API Version**: `2023-06-01`

## Yelp Fusion API Categories

### Valid Category Aliases
| Category | Yelp Alias |
|----------|------------|
| Restaurants | `restaurants` |
| Parks | `parks` |
| Grocery | `grocery` |
| Coffee | `coffee` |
| Bars | `bars` |
| Shopping | `shopping` |
| Gyms | `gyms` |
| Schools/Education | `education` |
| Medical | `physicians,hospitals,urgent_care` |

### Invalid Aliases (DO NOT USE)
- `schools` - Not valid, returns random results
- `medical` - Too broad, use specific aliases
- `educationalservices` - Does not exist
- `fitness` - Use `gyms` instead

## Project Architecture

### Key Files
- `lib/apis/claude.js` - Claude AI integration
- `lib/apis/yelp.js` - Yelp Fusion API integration
- `lib/apis/geocoding.js` - Google Maps geocoding
- `app/actions/analyze-hoa.js` - Main HOA analysis flow
- `app/actions/hoa-search.js` - Search and caching logic

### Data Quality Detection
- `data_completeness <= 30` indicates fallback/failed analysis
- Re-analysis is triggered when quality is low
- Fallback analysis returns `dataQuality.confidence: 'low'`

## Common Issues & Solutions

### Claude API 404 Error
**Cause**: Using deprecated model ID
**Solution**: Update to `claude-sonnet-4-5-20250929`

### Claude Returns JSON with Markdown Code Blocks
**Cause**: Claude wraps JSON in \`\`\`json ... \`\`\` blocks
**Solution**: Strip markdown before JSON.parse() - implemented in `analyzeHOAData()`
```javascript
if (response.startsWith('```json')) cleanedResponse = response.slice(7)
if (response.endsWith('```')) cleanedResponse = response.slice(0, -3)
```

### Yelp Returns Wrong Categories
**Cause**: Invalid category aliases
**Solution**: Use exact aliases from Yelp docs (see table above)

### Stale/Cached Data
**Cause**: Previous analysis with buggy code cached in DB
**Solution**: Check `data_completeness` - if <= 30, trigger re-analysis
