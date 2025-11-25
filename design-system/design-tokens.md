# HOA Scout Design System

## Core Design Principles
1. **Trust Through Transparency** - Show data sources, confidence levels, and methodology
2. **Clarity Over Cleverness** - Simple, scannable, digestible information chunks
3. **Actionable Insights** - Every data point leads to a decision or next step
4. **Mobile-First Responsive** - Optimized for on-the-go house hunting

## Design Tokens

### Color Palette

```css
/* Primary Colors */
--color-primary: #2563EB;        /* Trust Blue - CTAs and key scores */
--color-primary-hover: #1D4ED8;  /* Darker blue for hover states */
--color-primary-light: #DBEAFE;  /* Light blue for backgrounds */

/* Status Colors */
--color-success: #10B981;        /* Green flags and positive indicators */
--color-success-light: #D1FAE5;  /* Light green background */
--color-warning: #F59E0B;        /* Cautions and alerts */
--color-warning-light: #FED7AA;  /* Light warning background */
--color-danger: #EF4444;         /* Red flags and critical issues */
--color-danger-light: #FEE2E2;   /* Light danger background */

/* Neutral Colors */
--color-background: #F9FAFB;     /* Main background */
--color-surface: #FFFFFF;        /* Card backgrounds */
--color-border: #E5E7EB;         /* Borders and dividers */
--color-text-primary: #111827;   /* Primary text */
--color-text-secondary: #6B7280; /* Secondary text */
--color-text-muted: #9CA3AF;     /* Muted text */

/* Dark Theme Colors */
--color-dark-navy: #0F172A;      /* Dark navy background for split layouts */
--color-dark-text: #F1F5F9;      /* Light text on dark backgrounds */
--color-dark-muted: #94A3B8;     /* Muted text on dark backgrounds */

/* Semantic Colors */
--color-info: #3B82F6;            /* Information badges */
--color-info-light: #EFF6FF;     /* Light info background */
```

### Typography

```css
/* Font Family */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - Labels, badges */
--text-sm: 0.875rem;   /* 14px - Secondary text, captions */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body text */
--text-xl: 1.25rem;    /* 20px - Section headings */
--text-2xl: 1.5rem;    /* 24px - Page subheadings */
--text-3xl: 2rem;      /* 32px - Page headings */
--text-4xl: 2.5rem;    /* 40px - Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */

/* Component Padding */
--padding-xs: var(--space-2);
--padding-sm: var(--space-3);
--padding-md: var(--space-4);
--padding-lg: var(--space-6);
--padding-xl: var(--space-8);
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Cards, buttons */
--radius-lg: 0.75rem;   /* 12px - Large cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-full: 9999px;  /* Pills, circular elements */
```

### Shadows

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Breakpoints

```css
--breakpoint-mobile: 375px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1200px;
--breakpoint-wide: 1440px;

/* Container Max Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1200px;
```

### Animation

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-overlay: 30;
--z-modal: 40;
--z-popover: 50;
--z-tooltip: 60;
--z-notification: 70;
```

## Component Tokens

### Buttons

```css
/* Primary Button */
--btn-primary-bg: var(--color-primary);
--btn-primary-text: #FFFFFF;
--btn-primary-hover: var(--color-primary-hover);
--btn-primary-border: transparent;

/* Secondary Button */
--btn-secondary-bg: #FFFFFF;
--btn-secondary-text: var(--color-text-primary);
--btn-secondary-hover: var(--color-background);
--btn-secondary-border: var(--color-border);

/* Danger Button */
--btn-danger-bg: var(--color-danger);
--btn-danger-text: #FFFFFF;
--btn-danger-hover: #DC2626;
--btn-danger-border: transparent;

/* Button Sizes */
--btn-padding-sm: var(--space-2) var(--space-3);
--btn-padding-md: var(--space-3) var(--space-4);
--btn-padding-lg: var(--space-4) var(--space-6);
```

### Cards

```css
--card-bg: var(--color-surface);
--card-border: var(--color-border);
--card-shadow: var(--shadow-sm);
--card-radius: var(--radius-lg);
--card-padding: var(--space-6);
```

### Score Display

```css
--score-excellent: var(--color-success);     /* 8.5-10 */
--score-good: #34D399;                       /* 7-8.4 */
--score-fair: var(--color-warning);          /* 5.5-6.9 */
--score-poor: #FB923C;                       /* 4-5.4 */
--score-critical: var(--color-danger);       /* 0-3.9 */
```

### Data Source Badges

```css
--badge-bg: var(--color-background);
--badge-text: var(--color-text-muted);
--badge-border: var(--color-border);
--badge-radius: var(--radius-sm);
--badge-padding: var(--space-1) var(--space-2);
--badge-font-size: var(--text-xs);
```