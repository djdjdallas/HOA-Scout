# Component States and Interactions

## Interactive State Guidelines

### Core Interaction States

Every interactive component should support these states:

1. **Default**: Base resting state
2. **Hover**: Mouse over (desktop only)
3. **Active**: Being clicked/pressed
4. **Focus**: Keyboard navigation focus
5. **Disabled**: Non-interactive state
6. **Loading**: Processing/waiting state
7. **Error**: Invalid input or failure
8. **Success**: Successful completion

## Button States

### Primary Button

```css
/* Default */
.btn-primary {
  background: #2563EB;
  color: white;
  border: 2px solid transparent;
  transition: all 200ms ease;
}

/* Hover */
.btn-primary:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

/* Active/Pressed */
.btn-primary:active {
  background: #1E40AF;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

/* Focus (Keyboard) */
.btn-primary:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* Disabled */
.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

/* Loading */
.btn-primary.loading {
  position: relative;
  color: transparent;
}

.btn-primary.loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}
```

### Secondary Button

```css
/* Default */
.btn-secondary {
  background: white;
  color: #111827;
  border: 2px solid #E5E7EB;
}

/* Hover */
.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

/* Active */
.btn-secondary:active {
  background: #F3F4F6;
  border-color: #9CA3AF;
}
```

### Button Interaction Feedback

```typescript
// Visual feedback timing
const buttonInteraction = {
  hoverDelay: 0,        // Immediate
  hoverDuration: 200,   // ms
  pressScale: 0.98,     // Slight shrink
  releaseDelay: 50,     // ms before returning to normal
}
```

## Input Field States

### Text Input

```css
/* Default */
.input {
  border: 2px solid #E5E7EB;
  background: white;
  transition: all 150ms ease;
}

/* Hover */
.input:hover:not(:focus):not(:disabled) {
  border-color: #D1D5DB;
}

/* Focus */
.input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

/* Error */
.input.error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Success */
.input.success {
  border-color: #10B981;
  background: white;
}

/* Disabled */
.input:disabled {
  background: #F9FAFB;
  border-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* With validation icon */
.input-wrapper {
  position: relative;
}

.input-validation-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}
```

## Card States

### Interactive Cards

```css
/* Default */
.card-interactive {
  background: white;
  border: 1px solid #E5E7EB;
  transition: all 200ms ease;
  cursor: pointer;
}

/* Hover */
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #D1D5DB;
}

/* Active/Selected */
.card-interactive.selected {
  border: 2px solid #2563EB;
  background: #EFF6FF;
}

/* Focus */
.card-interactive:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
```

## Loading States

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Different skeleton shapes */
.skeleton-text {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-title {
  height: 24px;
  border-radius: 4px;
  width: 60%;
}

.skeleton-card {
  height: 120px;
  border-radius: 8px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

### Progress Indicators

```css
/* Linear Progress */
.progress-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563EB;
  transition: width 300ms ease;
}

/* Circular Progress */
.progress-circle {
  stroke-dasharray: 283;
  stroke-dashoffset: calc(283 - (283 * var(--progress)) / 100);
  transition: stroke-dashoffset 300ms ease;
}

/* Pulsing Dot */
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #2563EB;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}
```

## Micro-interactions

### Click Ripple Effect

```css
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 600ms ease-out;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

### Tooltip Appearance

```css
.tooltip {
  opacity: 0;
  transform: translateY(4px);
  transition: all 200ms ease;
  pointer-events: none;
}

.tooltip-trigger:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

### Expand/Collapse Animation

```css
.expandable-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease-out;
}

.expandable-content.expanded {
  max-height: 1000px; /* Adjust based on content */
  transition: max-height 300ms ease-in;
}

/* Chevron rotation */
.chevron {
  transition: transform 200ms ease;
}

.chevron.expanded {
  transform: rotate(180deg);
}
```

## Form Validation Feedback

### Real-time Validation

```typescript
// Validation states and timing
const validationFeedback = {
  debounceDelay: 500,     // ms after user stops typing
  successDuration: 2000,  // ms to show success state
  errorShake: {
    duration: 400,
    intensity: 4,
  }
}
```

### Error Shake Animation

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.error-shake {
  animation: shake 400ms ease-in-out;
}
```

### Success Check Animation

```css
@keyframes check-draw {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.success-check {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: check-draw 400ms ease-out forwards;
  animation-delay: 100ms;
}
```

## Navigation Transitions

### Page Transitions

```css
/* Fade transition */
.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
  transition: opacity 200ms ease-in;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-out;
}

/* Slide transition */
.slide-enter {
  transform: translateX(100%);
}

.slide-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}
```

### Tab Switching

```css
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: #2563EB;
  transition: all 300ms ease;
}

.tab-content {
  opacity: 0;
  transform: translateY(10px);
}

.tab-content.active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease;
}
```

## Modal & Overlay States

### Modal Animation

```css
/* Backdrop */
.modal-backdrop {
  opacity: 0;
  transition: opacity 200ms ease;
}

.modal-backdrop.open {
  opacity: 1;
}

/* Modal content */
.modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 200ms ease;
}

.modal-content.open {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

## Scroll-triggered Animations

### Fade In on Scroll

```css
.fade-in-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: all 600ms ease;
}

.fade-in-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Parallax Effect

```css
.parallax {
  transform: translateY(calc(var(--scroll-y) * -0.5));
  will-change: transform;
}
```

## Touch Interactions (Mobile)

### Touch Feedback

```css
/* Touch highlight */
.touch-feedback {
  -webkit-tap-highlight-color: rgba(37, 99, 235, 0.2);
}

/* Long press */
.long-press {
  transition: transform 200ms ease;
}

.long-press:active {
  transform: scale(0.95);
}
```

### Swipe Actions

```typescript
// Swipe gesture configuration
const swipeConfig = {
  threshold: 50,          // px minimum swipe distance
  velocity: 0.3,          // minimum velocity
  restraint: 100,         // max perpendicular distance
  allowedTime: 300,       // ms max time for swipe
}
```

## Accessibility Considerations

### Focus Management

```css
/* Focus visible only for keyboard navigation */
.interactive-element:focus {
  outline: none;
}

.interactive-element:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
```

### Motion Preferences

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Guidelines

### Animation Performance

1. **Use CSS transforms** instead of position properties
2. **Animate opacity and transform only** for best performance
3. **Use will-change sparingly** for elements that will animate
4. **Avoid animating during scroll** unless using requestAnimationFrame
5. **Use CSS containment** for complex animations

```css
.high-performance-animation {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
  backface-visibility: hidden; /* Prevent flickering */
}
```

### Interaction Debouncing

```typescript
// Debounce user input
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle scroll events
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return (...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};