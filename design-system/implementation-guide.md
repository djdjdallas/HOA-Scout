# HOA Scout Design Implementation Guide

## Quick Start

This guide provides everything you need to implement the HOA Scout design system in your Next.js application.

## Project Structure

```
/HOAscout
├── design-system/
│   ├── design-tokens.md          # Color, typography, spacing definitions
│   ├── components.md              # Component specifications
│   ├── responsive-breakpoints.md # Responsive design guidelines
│   ├── component-states.md       # Interaction states documentation
│   └── implementation-guide.md   # This file
├── components/
│   ├── landing-page.tsx          # Complete landing page
│   ├── loading-screen.tsx        # Loading/processing screen
│   ├── hoa-report-dashboard.tsx  # Main dashboard component
│   └── ui/
│       └── sample-components.tsx # Reusable component library
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Core dependencies
npm install react react-dom next

# Styling
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install @tailwindcss/forms @tailwindcss/typography

# UI Components
npm install lucide-react
npm install clsx tailwind-merge

# Data Visualization
npm install recharts

# Optional: shadcn/ui CLI
npx shadcn-ui@latest init
```

### 2. Configure Tailwind CSS

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FED7AA',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 3. Add Utility Function

Create `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4. Add Global Styles

Update `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 37 99 235;
    --color-success: 16 185 129;
    --color-warning: 245 158 11;
    --color-danger: 239 68 68;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-gray-50 text-gray-900;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  /* Focus visible styles */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  }

  /* Text balance for better line breaks */
  .text-balance {
    text-wrap: balance;
  }
}
```

## Component Usage Examples

### 1. Basic Page Layout

```tsx
import LandingPage from '@/components/landing-page';

export default function Home() {
  return <LandingPage />;
}
```

### 2. Loading State

```tsx
import LoadingScreen from '@/components/loading-screen';

export default function ProcessingPage() {
  return <LoadingScreen hoaName="Willowbrook HOA" />;
}
```

### 3. Report Dashboard

```tsx
import HOAReportDashboard from '@/components/hoa-report-dashboard';

export default function ReportPage() {
  return <HOAReportDashboard />;
}
```

### 4. Using Individual Components

```tsx
import {
  Button,
  ScoreDisplay,
  FlagCard,
  DataCard,
  SearchInput,
  Alert
} from '@/components/ui/sample-components';

export default function ComponentExample() {
  return (
    <div className="space-y-6 p-6">
      {/* Score Display */}
      <ScoreDisplay score={7.2} size="lg" />

      {/* Button Examples */}
      <div className="flex gap-4">
        <Button variant="primary">Get Report</Button>
        <Button variant="secondary">Learn More</Button>
        <Button variant="danger">Cancel</Button>
      </div>

      {/* Flag Cards */}
      <FlagCard
        type="danger"
        title="No guest parking after 6pm"
        description="Visitors must leave or face towing"
      />

      {/* Data Card */}
      <DataCard
        label="Monthly HOA Fee"
        value={285}
        unit="/month"
        trend="up"
        trendValue="+16% over 3 years"
        source="County Records"
      />

      {/* Search Input */}
      <SearchInput
        placeholder="Enter property address..."
        onSearch={(value) => console.log('Searching:', value)}
      />

      {/* Alert */}
      <Alert
        type="info"
        title="Report Ready"
        description="Your HOA analysis is complete"
        dismissible
      />
    </div>
  );
}
```

## API Integration Points

### 1. Search Endpoint

```typescript
// api/search.ts
export async function searchHOA(address: string) {
  const response = await fetch('/api/hoa/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return response.json();
}
```

### 2. Yelp Integration

```typescript
// api/yelp.ts
export async function getNeighborhoodData(location: string) {
  const response = await fetch('/api/yelp/neighborhood', {
    method: 'GET',
    params: { location }
  });
  return response.json();
}
```

### 3. Report Generation

```typescript
// api/report.ts
export async function generateReport(hoaId: string) {
  // Start processing
  const { jobId } = await fetch('/api/report/generate', {
    method: 'POST',
    body: JSON.stringify({ hoaId })
  }).then(res => res.json());

  // Poll for completion
  return pollForCompletion(jobId);
}
```

## State Management

### Using React Context for Global State

```typescript
// context/AppContext.tsx
import { createContext, useContext, useState } from 'react';

interface AppContextType {
  currentHOA: HOAData | null;
  setCurrentHOA: (hoa: HOAData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentHOA, setCurrentHOA] = useState<HOAData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider value={{
      currentHOA,
      setCurrentHOA,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

## Responsive Design Patterns

### Mobile-First Approach

```tsx
// Always design for mobile first, then add tablet/desktop styles
<div className="
  grid grid-cols-1       // Mobile: single column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-3        // Desktop: 3 columns
  gap-4 md:gap-6        // Responsive spacing
">
  {/* Content */}
</div>
```

### Conditional Rendering

```tsx
// Show different content based on screen size
<>
  {/* Mobile view */}
  <div className="md:hidden">
    <MobileNavigation />
  </div>

  {/* Desktop view */}
  <div className="hidden md:block">
    <DesktopNavigation />
  </div>
</>
```

## Performance Optimization

### 1. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/hoa-hero.jpg"
  alt="HOA Community"
  width={1200}
  height={400}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="..." // Base64 placeholder
/>
```

### 2. Code Splitting

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HOAReportDashboard = dynamic(
  () => import('@/components/hoa-report-dashboard'),
  {
    loading: () => <LoadingScreen />,
    ssr: false // Disable SSR for client-only components
  }
);
```

### 3. Data Fetching

```tsx
// Use SWR for data fetching with caching
import useSWR from 'swr';

function useHOAData(hoaId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/hoa/${hoaId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    hoa: data,
    isLoading,
    isError: error
  };
}
```

## Accessibility Checklist

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] All images have appropriate alt text
- [ ] Forms have proper labels and error messages
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announcements for dynamic content
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Reduced motion preferences respected

## Testing

### 1. Component Testing

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/sample-components';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-transparent');
  });
});
```

### 2. Visual Testing

Use tools like:
- Storybook for component documentation
- Chromatic for visual regression testing
- Percy for cross-browser visual testing

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints secured
- [ ] Images optimized and using CDN
- [ ] CSS purged of unused styles
- [ ] JavaScript bundles optimized
- [ ] Meta tags and SEO configured
- [ ] Analytics tracking implemented
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] SSL certificate configured

## Browser Support

Minimum supported versions:
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

## Resources

- [Design Tokens](/design-system/design-tokens.md)
- [Component Library](/design-system/components.md)
- [Responsive Guidelines](/design-system/responsive-breakpoints.md)
- [Interaction States](/design-system/component-states.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Support

For design questions or implementation help:
- Review the design system documentation
- Check component examples in `/components/ui/`
- Test responsive behavior at all breakpoints
- Ensure accessibility standards are met

Remember: This is a high-stakes decision tool. Clarity, trust, and reliability should guide every implementation decision.