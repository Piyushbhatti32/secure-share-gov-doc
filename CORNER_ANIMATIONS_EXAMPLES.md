# Universal Corner Spinning Animations - Usage Guide

## 🎯 Overview
These corner-only spinning animations can be applied to ANY element in your application to create beautiful, modern UI effects without covering content.

## 🚀 Basic Usage

### 1. Simple Corner Border
```html
<!-- Basic spinning corner border -->
<div class="corner-border">
  Your content here
</div>
```

### 2. Colored Corner Border
```html
<!-- Blue spinning corner -->
<div class="corner-border corner-blue">
  Blue corner animation
</div>

<!-- Green spinning corner -->
<div class="corner-border corner-green">
  Green corner animation
</div>
```

## 🎨 Available Classes

### Base Classes
- `.corner-border` - Basic corner spinning animation
- `.corner-spin` - Alternative base class (legacy)

### Colors
- `.corner-blue` - Electric blue (#00d4ff)
- `.corner-cyan` - Bright cyan (#00ffff)
- `.corner-green` - Electric green (#00ff88)
- `.corner-purple` - Electric purple (#8a2be2)
- `.corner-red` - Electric red (#ff4545)
- `.corner-orange` - Electric orange (#ff8c00)
- `.corner-yellow` - Electric yellow (#ffd700)
- `.corner-pink` - Electric pink (#ff69b4)

### Speeds
- `.corner-fast` - 2 seconds
- `.corner-normal` - 4 seconds (default)
- `.corner-slow` - 6 seconds
- `.corner-very-slow` - 8 seconds

### Effects
- `.corner-glow` - Blurred glow effect
- `.corner-subtle` - Subtle, low opacity
- `.corner-bold` - Sharp, high opacity

### Sizes
- `.corner-thin` - 1px border
- `.corner-thick` - 3px border
- `.corner-extra-thick` - 5px border

### Directions
- `.corner-reverse` - Counter-clockwise rotation

### Corner Radius
- `.radius-none` - No radius
- `.radius-sm` - Small radius (6px)
- `.radius-md` - Medium radius (8px)
- `.radius-lg` - Large radius (12px)
- `.radius-xl` - Extra large radius (16px)
- `.radius-2xl` - 2X large radius (24px)
- `.radius-3xl` - 3X large radius (32px)
- `.radius-full` - Full rounded (9999px)

### Animation Styles
- `.corner-pulse` - Pulsing effect
- `.corner-bounce` - Bouncing effect
- `.corner-fade` - Fading effect

### Hover Effects
- `.corner-hover` - Color change on hover

### Mobile Responsive
- `.corner-mobile-subtle` - Subtle on mobile
- `.corner-mobile-hidden` - Hidden on mobile

## 🔧 Real-World Examples

### 1. Dashboard Cards
```html
<!-- Stats card with blue fast spinning corner -->
<div class="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 electric-border corner-border corner-blue corner-fast radius-xl">
  <h3>Total Documents</h3>
  <p>1,234</p>
</div>

<!-- Activity card with green normal spinning corner -->
<div class="bg-black/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-4 electric-border corner-border corner-green corner-normal radius-lg">
  <h3>Recent Activity</h3>
  <ul>...</ul>
</div>
```

### 2. Buttons
```html
<!-- Primary button with blue corner -->
<button class="bg-blue-600 text-white px-6 py-3 rounded-lg corner-border corner-blue corner-fast radius-lg">
  Upload Document
</button>

<!-- Success button with green corner -->
<button class="bg-green-600 text-white px-6 py-3 rounded-lg corner-border corner-green corner-normal radius-md">
  Save Changes
</button>
```

### 3. Form Elements
```html
<!-- Input field with cyan corner -->
<input type="text" class="bg-gray-800 text-white px-4 py-2 rounded-md corner-border corner-cyan corner-slow radius-md" placeholder="Enter filename">

<!-- Textarea with purple corner -->
<textarea class="bg-gray-800 text-white px-4 py-2 rounded-md corner-border corner-purple corner-very-slow radius-lg" rows="4"></textarea>
```

### 4. Navigation
```html
<!-- Nav item with orange corner -->
<nav class="corner-border corner-orange corner-fast radius-full">
  <a href="/dashboard" class="px-4 py-2">Dashboard</a>
</nav>

<!-- Sidebar with pink corner -->
<aside class="bg-gray-900 p-4 corner-border corner-pink corner-slow radius-xl">
  <h3>Quick Actions</h3>
  <ul>...</ul>
</aside>
```

### 5. Modals & Overlays
```html
<!-- Modal with rainbow corner effect -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div class="bg-gray-800 p-6 rounded-xl corner-border corner-rainbow corner-glow radius-2xl">
    <h2>Confirm Action</h2>
    <p>Are you sure you want to proceed?</p>
    <div class="flex gap-4 mt-4">
      <button class="px-4 py-2 bg-red-600 rounded corner-border corner-red corner-fast">Cancel</button>
      <button class="px-4 py-2 bg-green-600 rounded corner-border corner-green corner-fast">Confirm</button>
    </div>
  </div>
</div>
```

### 6. Tables & Lists
```html
<!-- Table with subtle corner -->
<table class="w-full corner-border corner-blue corner-subtle radius-lg">
  <thead>
    <tr>
      <th>Name</th>
      <th>Size</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>

<!-- List with green corner -->
<ul class="space-y-2 corner-border corner-green corner-slow radius-md">
  <li>Document 1</li>
  <li>Document 2</li>
  <li>Document 3</li>
</ul>
```

### 7. Cards & Panels
```html
<!-- Info panel with cyan corner -->
<div class="bg-blue-900/20 border border-blue-500/30 p-4 corner-border corner-cyan corner-glow radius-xl">
  <h3>Information</h3>
  <p>This is an informational panel with a cyan spinning corner.</p>
</div>

<!-- Warning panel with yellow corner -->
<div class="bg-yellow-900/20 border border-yellow-500/30 p-4 corner-border corner-yellow corner-pulse radius-lg">
  <h3>Warning</h3>
  <p>This is a warning panel with a yellow pulsing corner.</p>
</div>
```

## 🎭 Advanced Combinations

### 1. Multiple Effects
```html
<!-- Fast blue corner with glow and large radius -->
<div class="corner-border corner-blue corner-fast corner-glow radius-2xl">
  Premium content
</div>
```

### 2. Responsive Design
```html
<!-- Desktop: bold, mobile: subtle -->
<div class="corner-border corner-purple corner-bold corner-mobile-subtle">
  Responsive corner
</div>
```

### 3. Hover Interactions
```html
<!-- Color changes on hover -->
<div class="corner-border corner-blue corner-hover" style="--corner-hover-color: #00ffff">
  Hover me!
</div>
```

### 4. Direction Variations
```html
<!-- Two cards with opposite directions -->
<div class="corner-border corner-green corner-fast">Clockwise</div>
<div class="corner-border corner-green corner-fast corner-reverse">Counter-clockwise</div>
```

## 📱 Mobile Considerations

### 1. Performance
```html
<!-- Subtle on mobile for better performance -->
<div class="corner-border corner-blue corner-mobile-subtle">
  Mobile-optimized
</div>
```

### 2. Visibility
```html
<!-- Hidden on mobile if too distracting -->
<div class="corner-border corner-rainbow corner-mobile-hidden">
  Desktop only
</div>
```

## ♿ Accessibility

### 1. Reduced Motion
The animations automatically respect `prefers-reduced-motion: reduce` and will be disabled for users who prefer minimal animations.

### 2. High Contrast
Use `.corner-bold` for better visibility in high contrast modes.

## 🎨 Customization

### 1. Custom Colors
```css
.my-custom-corner {
  --corner-color: #ff6b6b;
  --corner-hover-color: #ff8e8e;
}
```

### 2. Custom Speeds
```css
.my-slow-corner {
  --spin-duration: 10s;
}
```

### 3. Custom Sizes
```css
.my-thick-corner {
  --edge-width: 8px;
}
```

## 🚀 Best Practices

1. **Use sparingly** - Don't animate every element
2. **Match content** - Use colors that complement your design
3. **Consider performance** - Use `.corner-mobile-subtle` on mobile
4. **Respect preferences** - Animations auto-disable for reduced motion
5. **Test combinations** - Ensure multiple classes work well together

## 🔍 Troubleshooting

### Common Issues:
1. **Animation not visible** - Check z-index and positioning
2. **Corner too large** - Use `.corner-small` or `.corner-medium`
3. **Performance issues** - Use `.corner-mobile-subtle` on mobile
4. **Color not changing** - Ensure CSS custom properties are set correctly

### Browser Support:
- Modern browsers with CSS custom properties support
- Graceful fallback for older browsers
- Mobile-optimized variants available
