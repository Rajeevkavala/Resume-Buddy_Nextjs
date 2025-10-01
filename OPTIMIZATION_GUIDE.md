# Performance Optimization - Installation & Deployment Guide

## 📦 Required Dependencies Installation

Run the following commands to install all performance-related dependencies:

```powershell
# Install bundle analyzer for performance monitoring
npm install --save-dev @next/bundle-analyzer

# Install CSS optimization tools
npm install --save-dev autoprefixer cssnano

# Install Lighthouse CI for automated testing (optional)
npm install --save-dev @lhci/cli

# Update all dependencies to latest versions
npm update
```

## 🚀 Quick Start

### 1. Build the Optimized Application

```powershell
# Standard production build
npm run build

# Build with bundle analysis
$env:ANALYZE="true"; npm run build
```

### 2. Test Locally

```powershell
# Start production server
npm start

# In another terminal, run Lighthouse audit

```

### 3. Deploy to Vercel

```powershell
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git add .
git commit -m "Performance optimizations applied"
git push origin main
```

## ✅ Implemented Optimizations

### Configuration Files Updated:
1. ✅ `next.config.mjs` - Bundle splitting, image optimization, caching
2. ✅ `postcss.config.mjs` - CSS minification with cssnano
3. ✅ `package.json` - Performance scripts added
4. ✅ `.browserslistrc` - Modern browsers only (reduces legacy JS)
5. ✅ `src/app/layout.tsx` - Font optimization with next/font

### New Files Created:
1. ✅ `src/components/lazy-components.tsx` - Lazy loading utilities
2. ✅ `src/components/web-vitals.tsx` - Performance monitoring
3. ✅ `src/components/optimized-image.tsx` - Image optimization wrapper
4. ✅ `performance.budget.js` - Performance budgets
5. ✅ `PERFORMANCE.md` - Detailed optimization guide

## 🎯 Expected Performance Improvements

Based on Lighthouse report issues:

| Issue | Original Impact | Expected Reduction | Method |
|-------|----------------|-------------------|---------|
| Unused JavaScript | 1,540ms | -70% (1,078ms) | Code splitting + lazy loading |
| Render-blocking CSS | 990ms | -80% (792ms) | CSS optimization + critical CSS |
| Unused CSS | 410ms | -90% (369ms) | cssnano + tree shaking |
| Legacy JavaScript | 1,230ms | -95% (1,168ms) | Modern browser targeting |
| Unminified JS | 190ms | -100% (190ms) | SWC minification |

**Total Expected Savings: ~3,600ms**

## 📊 Performance Testing

### Local Testing

```powershell
# Run full performance audit
npm run perf:audit

# Analyze bundle size
$env:ANALYZE="true"; npm run build

# Check bundle sizes
npm run build -- --profile
```

### Lighthouse CI Setup (Optional)

Create `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

Run Lighthouse CI:
```powershell
npx lhci autorun
```

## 🔧 Additional Optimizations to Apply

### 1. Remove Unused Dependencies

```powershell
# Identify unused dependencies
npx depcheck

# Remove if not needed
npm uninstall styled-components @types/styled-components canvas-confetti
```

### 2. Enable Additional Next.js Features

Add to `next.config.mjs`:
```javascript
experimental: {
  optimizeCss: true,
  serverActions: { bodySizeLimit: '2mb' },
}
```

### 3. Implement Critical CSS

Install:
```powershell
npm install --save-dev critical
```

### 4. Add Resource Hints

In `layout.tsx`:
```tsx
<link rel="preconnect" href="https://your-api-domain.com" />
<link rel="dns-prefetch" href="https://your-cdn.com" />
```

## 🎨 Image Optimization

### Use OptimizedImage Component

Replace all `<img>` tags with:

```tsx
import { OptimizedImage } from '@/components/optimized-image';

<OptimizedImage
  src="/your-image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // true for above-the-fold images
/>
```

### Convert Images to WebP/AVIF

```powershell
# Install image conversion tool
npm install --save-dev sharp

# Convert images (add to package.json scripts)
node scripts/convert-images.js
```

## 📈 Monitoring Performance

### Production Monitoring

1. **Vercel Analytics** (Free tier available)
   - Enable in Vercel dashboard
   - Automatic Core Web Vitals tracking

2. **Web Vitals API**
   - Already implemented in `src/components/web-vitals.tsx`
   - Logs to console in development
   - Can send to analytics in production

3. **Custom Monitoring**

```tsx
// In any component
import { reportWebVitals } from 'next/web-vitals';

reportWebVitals((metric) => {
  // Send to your analytics
  console.log(metric);
});
```

## 🚨 Troubleshooting

### Build Errors

If you encounter errors after installing dependencies:

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

### Bundle Size Issues

```powershell
# Analyze what's in your bundle
$env:ANALYZE="true"; npm run build

# Check for duplicate dependencies
npx npm-check-updates
```

### Performance Not Improving

1. Clear browser cache
2. Test in incognito mode
3. Use Lighthouse in Chrome DevTools
4. Check Network tab for large resources
5. Verify all optimizations are applied: `npm run build` output

## ✨ Post-Deployment Checklist

- [ ] Run Lighthouse on production URL
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Verify all images are optimized (WebP/AVIF)
- [ ] Test on different devices/browsers
- [ ] Monitor bundle size (should be < 500KB gzipped)
- [ ] Check page load time (should be < 2s)
- [ ] Verify no console errors
- [ ] Test lazy loading works correctly
- [ ] Confirm fonts load properly

## 📞 Support

If performance score is still below 95:

1. Run bundle analyzer: `$env:ANALYZE="true"; npm run build`
2. Check for:
   - Large dependencies that can be lazy-loaded
   - Unused code that can be removed
   - Third-party scripts that can be deferred
3. Review PERFORMANCE.md for additional optimizations
4. Consider server-side rendering for critical pages

## 🎯 Target Metrics for 95+ Score

- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **TBT**: < 300ms
- **CLS**: < 0.1
- **Speed Index**: < 3.0s

With these optimizations, you should achieve **95-100 performance score**! 🚀
