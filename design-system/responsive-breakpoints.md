# Responsive Breakpoint Specifications

## Breakpoint Definitions

### Core Breakpoints

```css
/* Mobile First Approach */
--breakpoint-xs: 375px;   /* Small mobile devices */
--breakpoint-sm: 640px;   /* Large mobile devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1200px;  /* Standard desktops */
--breakpoint-2xl: 1440px; /* Large desktops */
```

### Tailwind CSS Breakpoint Mapping

```css
/* Default (Mobile): 0px - 639px */
/* sm: 640px and up */
/* md: 768px and up */
/* lg: 1024px and up */
/* xl: 1280px and up */
/* 2xl: 1536px and up */
```

## Layout Specifications by Breakpoint

### Mobile (0-767px)

#### General Layout
- **Container**: 100% width with 16px padding
- **Grid**: Single column
- **Navigation**: Hamburger menu
- **Cards**: Full width, stacked vertically
- **Font sizes**: Base 16px for optimal readability

#### Component Specifications
```css
/* Mobile Layout */
.container {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
}

.header {
  height: 56px;
  position: sticky;
  top: 0;
}

.card {
  width: 100%;
  margin-bottom: 16px;
}

.button {
  min-height: 44px; /* Touch target */
  width: 100%;
}

.text-heading {
  font-size: 24px;
}

.text-body {
  font-size: 16px;
}
```

#### Mobile-Specific Features
- Touch-optimized controls (44px minimum touch targets)
- Swipeable cards for horizontal content
- Bottom sheet modals
- Floating action buttons
- Simplified navigation
- Collapsed sections by default
- Single column forms

### Tablet (768px-1199px)

#### General Layout
- **Container**: Max-width 768px, centered
- **Grid**: 2 columns for content
- **Navigation**: Horizontal nav bar
- **Cards**: 2-column grid where appropriate
- **Sidebar**: Optional, 250px width

#### Component Specifications
```css
/* Tablet Layout */
.container {
  max-width: 768px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.header {
  height: 64px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.sidebar {
  width: 250px;
  position: fixed;
}

.content-with-sidebar {
  margin-left: 274px; /* sidebar + gap */
}

.text-heading {
  font-size: 32px;
}
```

#### Tablet-Specific Features
- Side-by-side comparisons
- 2-column card layouts
- Modal dialogs (not full screen)
- Hover states enabled
- Expanded navigation
- Multi-column forms

### Desktop (1200px+)

#### General Layout
- **Container**: Max-width 1200px, centered
- **Grid**: 3-4 columns for content
- **Navigation**: Full horizontal nav with dropdowns
- **Cards**: Multi-column grid (3-4 columns)
- **Sidebar**: 280px width

#### Component Specifications
```css
/* Desktop Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 32px;
  padding-right: 32px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.sidebar {
  width: 280px;
}

.content-with-sidebar {
  margin-left: 312px; /* sidebar + gap */
}

.text-heading {
  font-size: 40px;
}

.card {
  min-height: 200px;
}
```

#### Desktop-Specific Features
- Advanced data visualizations
- Multi-column layouts
- Keyboard navigation
- Tooltips on hover
- Expanded data tables
- Side-by-side panels
- Fixed sidebars

## Component-Specific Responsive Behavior

### Navigation Header

```tsx
// Mobile (< 768px)
<nav className="h-14 px-4 flex justify-between items-center md:hidden">
  <Logo size="sm" />
  <HamburgerMenu />
</nav>

// Tablet/Desktop (>= 768px)
<nav className="hidden md:flex h-16 px-6 justify-between items-center">
  <Logo size="md" />
  <NavLinks />
  <UserActions />
</nav>
```

### Score Display

```tsx
// Mobile: Centered, smaller
<div className="w-24 h-24 mx-auto md:w-32 md:h-32 lg:w-40 lg:h-40">
  <ScoreCircle />
</div>

// Desktop: Larger, with more detail
<div className="flex items-center space-x-4">
  <ScoreCircle size="lg" />
  <ScoreDetails />
</div>
```

### Cards Grid

```tsx
// Responsive grid with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

### Data Tables

```tsx
// Mobile: Simplified card view
<div className="md:hidden">
  {data.map(item => (
    <DataCard key={item.id} {...item} />
  ))}
</div>

// Desktop: Full table
<table className="hidden md:table">
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

### Forms

```tsx
// Mobile: Stacked
<form className="space-y-4">
  <Input fullWidth />
  <Input fullWidth />
  <Button fullWidth />
</form>

// Desktop: Multi-column
<form className="md:grid md:grid-cols-2 md:gap-4">
  <Input />
  <Input />
  <Button className="md:col-span-2" />
</form>
```

## Responsive Typography Scale

### Mobile Typography
```css
.text-xs    { font-size: 12px; line-height: 16px; }
.text-sm    { font-size: 14px; line-height: 20px; }
.text-base  { font-size: 16px; line-height: 24px; }
.text-lg    { font-size: 18px; line-height: 28px; }
.text-xl    { font-size: 20px; line-height: 28px; }
.text-2xl   { font-size: 24px; line-height: 32px; }
.text-3xl   { font-size: 28px; line-height: 36px; }
```

### Tablet Typography
```css
@media (min-width: 768px) {
  .text-xl  { font-size: 22px; line-height: 30px; }
  .text-2xl { font-size: 28px; line-height: 36px; }
  .text-3xl { font-size: 32px; line-height: 40px; }
  .text-4xl { font-size: 36px; line-height: 44px; }
}
```

### Desktop Typography
```css
@media (min-width: 1200px) {
  .text-xl  { font-size: 24px; line-height: 32px; }
  .text-2xl { font-size: 30px; line-height: 38px; }
  .text-3xl { font-size: 36px; line-height: 44px; }
  .text-4xl { font-size: 40px; line-height: 48px; }
  .text-5xl { font-size: 48px; line-height: 56px; }
}
```

## Responsive Spacing System

### Mobile Spacing
```css
.p-2  { padding: 8px; }
.p-4  { padding: 16px; }
.p-6  { padding: 24px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
```

### Tablet/Desktop Spacing
```css
@media (min-width: 768px) {
  .md\:p-4 { padding: 16px; }
  .md\:p-6 { padding: 24px; }
  .md\:p-8 { padding: 32px; }
  .md\:gap-4 { gap: 16px; }
  .md\:gap-6 { gap: 24px; }
}

@media (min-width: 1200px) {
  .lg\:p-6 { padding: 24px; }
  .lg\:p-8 { padding: 32px; }
  .lg\:p-10 { padding: 40px; }
  .lg\:gap-6 { gap: 24px; }
  .lg\:gap-8 { gap: 32px; }
}
```

## Image Responsive Guidelines

### Image Sizing
```css
/* Mobile */
.hero-image {
  height: 200px;
  object-fit: cover;
}

/* Tablet */
@media (min-width: 768px) {
  .hero-image {
    height: 300px;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .hero-image {
    height: 400px;
  }
}
```

### Responsive Images with srcset
```html
<img
  src="image-mobile.jpg"
  srcset="
    image-mobile.jpg 375w,
    image-tablet.jpg 768w,
    image-desktop.jpg 1200w"
  sizes="
    (max-width: 768px) 100vw,
    (max-width: 1200px) 50vw,
    33vw"
  alt="Description"
/>
```

## Performance Considerations

### Mobile Optimizations
- Lazy load images below the fold
- Minimize JavaScript bundles
- Use CSS transforms for animations
- Reduce API calls
- Implement virtual scrolling for long lists
- Compress images (WebP format)

### Desktop Enhancements
- Prefetch data on hover
- Load advanced visualizations
- Enable complex interactions
- Parallel data loading
- Higher resolution images

## Testing Requirements

### Device Testing Matrix
1. **Mobile Devices**
   - iPhone SE (375px)
   - iPhone 12/13/14 (390px)
   - Android phones (360px-414px)

2. **Tablets**
   - iPad Mini (768px)
   - iPad Pro (834px-1024px)
   - Android tablets (800px-1280px)

3. **Desktop**
   - Small laptops (1366px)
   - Standard monitors (1920px)
   - Large displays (2560px+)

### Browser Compatibility
- Chrome (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)

### Responsive Testing Checklist
- [ ] Navigation works at all breakpoints
- [ ] Touch targets are 44px+ on mobile
- [ ] Text remains readable (16px+ on mobile)
- [ ] Images scale appropriately
- [ ] Forms are usable on all devices
- [ ] Modals/overlays work correctly
- [ ] Horizontal scrolling is avoided
- [ ] Content reflows properly
- [ ] Interactive elements are accessible