# HOA Scout Component Library

## Core Components

### 1. Search Input

**Purpose:** Primary address/neighborhood search with autocomplete

```tsx
interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  suggestions?: string[];
  loading?: boolean;
}
```

**States:**
- Default: Light gray border, white background
- Focus: Blue border, slight shadow
- Loading: Animated spinner on right
- Error: Red border with error message below
- Success: Green check icon on right

**Specifications:**
- Height: 56px (mobile), 48px (desktop)
- Padding: 16px horizontal
- Icon: Search icon on left (20px)
- Font size: 16px (prevents zoom on mobile)
- Border radius: 8px

### 2. Score Display

**Purpose:** Show HOA overall score prominently

```tsx
interface ScoreDisplayProps {
  score: number; // 0-10
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animated?: boolean;
}
```

**Visual Design:**
- Circular progress ring
- Center: Score number (e.g., "7.2")
- Color based on score range:
  - 8.5-10: Green (#10B981)
  - 7-8.4: Light Green (#34D399)
  - 5.5-6.9: Yellow (#F59E0B)
  - 4-5.4: Orange (#FB923C)
  - 0-3.9: Red (#EF4444)

**Sizes:**
- sm: 64px diameter, 20px font
- md: 96px diameter, 32px font
- lg: 128px diameter, 40px font
- xl: 160px diameter, 48px font

### 3. Flag Cards

**Purpose:** Display red flags, cautions, and green flags

```tsx
interface FlagCardProps {
  type: 'danger' | 'warning' | 'success';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Visual Design:**
- Card with colored left border (4px)
- Icon on left (24px)
- Title: font-semibold, color-text-primary
- Description: font-normal, color-text-secondary
- Background: Light tint of flag color
- Padding: 16px
- Border radius: 8px

### 4. Data Card

**Purpose:** Display key metrics with source attribution

```tsx
interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  source?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  confidence?: 'high' | 'medium' | 'low';
}
```

**Visual Design:**
- White background card
- Label: 12px, uppercase, color-text-muted
- Value: 24px, font-semibold, color-text-primary
- Unit: 16px, font-normal, color-text-secondary
- Source badge: 10px, positioned bottom-right
- Trend arrow: colored based on positive/negative
- Confidence indicator: 3 dots (filled based on level)

### 5. Expandable Section

**Purpose:** Show/hide detailed information

```tsx
interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}
```

**Visual Design:**
- Header: Always visible, clickable
- Chevron icon: Rotates on expand (right side)
- Content: Smooth height animation
- Border: 1px solid border-color
- Hover: Light gray background on header
- Padding: 20px header, 24px content

### 6. Progress Stepper

**Purpose:** Show loading progress during data collection

```tsx
interface ProgressStepperProps {
  steps: Array<{
    label: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
    description?: string;
  }>;
  orientation?: 'horizontal' | 'vertical';
}
```

**Visual Design:**
- Step circle: 32px diameter
- Line between steps: 2px, dashed when pending
- Active step: Pulsing animation
- Complete: Green check icon
- Error: Red X icon
- Label: 14px, font-medium
- Description: 12px, color-text-secondary

### 7. Comparison Table

**Purpose:** Side-by-side HOA comparison

```tsx
interface ComparisonTableProps {
  items: Array<{
    label: string;
    values: Array<string | number>;
    highlight?: boolean;
  }>;
  headers: string[];
}
```

**Visual Design:**
- Sticky header row
- Zebra striping on rows
- Highlight differences: Bold + colored background
- Mobile: Horizontal scroll with frozen first column
- Desktop: Full width display

### 8. Chart Components

**Purpose:** Financial and trend visualizations

```tsx
interface ChartProps {
  data: Array<{ label: string; value: number }>;
  type: 'line' | 'bar' | 'pie' | 'donut';
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}
```

**Visual Design:**
- Clean, minimal style
- Muted grid lines
- Interactive tooltips on hover
- Color palette: Use status colors
- Responsive sizing
- Mobile: Simplified, touch-friendly

### 9. Navigation Header

**Purpose:** Sticky header with context

```tsx
interface HeaderProps {
  hoaName?: string;
  score?: number;
  showBackButton?: boolean;
  actions?: React.ReactNode;
}
```

**Visual Design:**
- Height: 64px
- Background: White with shadow on scroll
- Logo: Left side, 32px height
- Score pill: Center (when in report view)
- Actions: Right side (download, share)
- Mobile: Compressed to 56px

### 10. Action Button (FAB)

**Purpose:** Floating action for primary CTA on mobile

```tsx
interface FABProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-center';
}
```

**Visual Design:**
- Size: 56px diameter (icon only) or auto width (with label)
- Position: Fixed, 16px from edges
- Shadow: shadow-lg
- Background: color-primary
- Animation: Scale on appear

## Form Components

### Input Field

```tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number';
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**States:**
- Default, Focus, Error, Disabled, Success
- Error message: Red text below, slide animation
- Helper text: Gray text below
- Label: Above input, 14px, font-medium

### Select Dropdown

```tsx
interface SelectProps {
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}
```

**Design:**
- Custom styled to match inputs
- Chevron down icon on right
- Dropdown: Absolute positioned, shadowed
- Max height: 240px with scroll
- Hover: Light gray background on options

## Interactive States

### Hover States
- Buttons: Darken by 10%
- Cards: Subtle shadow increase
- Links: Underline
- Clickable areas: Cursor pointer

### Focus States
- Keyboard navigation: 2px blue outline
- Offset: 2px
- No outline on click (only keyboard)

### Loading States
- Skeleton screens for content
- Pulse animation for placeholders
- Spinners for actions
- Progress bars for multi-step

### Disabled States
- Opacity: 0.5
- Cursor: not-allowed
- No hover effects
- Gray color scheme

## Animation Guidelines

### Transitions
- Default duration: 200ms
- Easing: ease-in-out
- Properties: opacity, transform, height
- Avoid animating layout properties

### Micro-interactions
- Button press: Scale(0.98)
- Card hover: TranslateY(-2px)
- Score appear: Scale from 0 with bounce
- Success: Check mark draw animation

### Loading Animations
- Spinner: Rotate 360deg, 1s, infinite
- Skeleton: Pulse opacity 1.5s
- Progress: Smooth width transition
- Dots: Sequential fade in/out

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Color contrast: 4.5:1 for normal text
- 3:1 for large text and UI components
- Focus indicators: Always visible on keyboard nav
- Screen reader support: Proper ARIA labels

### Keyboard Navigation
- Tab order: Logical flow
- Enter/Space: Activate buttons
- Arrow keys: Navigate options
- Escape: Close modals/dropdowns

### Touch Targets
- Minimum: 44x44px on mobile
- Spacing: 8px minimum between targets
- Hover area: Extends beyond visual boundary

## Responsive Behavior

### Mobile (375px - 767px)
- Single column layouts
- Full-width cards
- Collapsed navigation
- Touch-optimized controls
- Simplified data visualizations

### Tablet (768px - 1199px)
- Two-column layouts where appropriate
- Medium-sized components
- Side navigation option
- Balanced information density

### Desktop (1200px+)
- Multi-column layouts
- Maximum content width: 1200px
- Side-by-side comparisons
- Full data visualizations
- Hover interactions enabled