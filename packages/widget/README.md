# Tresta Widget

CDN-delivered testimonial widget system for embedding customer testimonials on any website.

## Project Structure

```
src/
├── index.ts                 # Entry point, IIFE wrapper
├── types/
│   └── index.ts            # TypeScript type definitions
├── core/
│   ├── widget.ts           # Main Widget class
│   ├── loader.ts           # Auto-initialization logic
│   └── config.ts           # Configuration parser
├── api/                    # (Future) API client
├── layouts/                # (Future) Layout implementations
├── components/             # (Future) UI components
├── storage/                # (Future) Cache management
├── security/               # (Future) Sanitization
├── telemetry/              # (Future) Analytics
└── styles/
    └── base.css            # Base styles
```

## Build Configuration

### Bundle Size Budgets

- **Core runtime**: 50KB gzipped (target), 100KB (hard limit)
- **Layout chunks**: 12KB gzipped each
- **Total bundle**: 100KB gzipped

### Build Commands

```bash
# Development build with hot reload
pnpm dev

# Production build
pnpm build

# Check bundle size budgets
pnpm check-budgets

# Build with bundle analyzer
pnpm analyze

# Preview production build
pnpm preview
```

## Build Output

The build produces:

- `dist/tresta-widget.iife.js` - Main bundle (IIFE format)
- `dist/tresta-widget.iife.js.gz` - Gzipped version
- `dist/tresta-widget.iife.js.br` - Brotli compressed version
- `dist/tresta-widget.iife.js.map` - Source map (not for CDN)
- `dist/layout-*.js` - Layout chunks (code-split)
- `dist/stats.html` - Bundle analysis (when using `pnpm analyze`)

## Usage

### Standard Embed

```html
<div id="tresta-widget-123" data-widget-id="123"></div>
<script async src="https://cdn.tresta.app/widget/v1.0.0/tresta-widget.iife.js" 
        data-widget-id="123"></script>
```

### Programmatic API

```javascript
// Mount widget
const widget = TrestaWidget.mount('#container', {
  widgetId: '123',
  debug: true
});

// Unmount widget
TrestaWidget.unmount('#container');
```

## Security & Compliance

### Content Security Policy (CSP)

The widget is fully CSP-compliant and works in strict CSP environments. See [CSP_COMPLIANCE.md](./CSP_COMPLIANCE.md) for:

- Required CSP directives
- CSP-friendly embed code examples
- Nonce and SRI support
- Troubleshooting guide

### CSP Audit

Run the automated CSP compliance audit:

```bash
pnpm audit-csp
```

This checks for:
- No `eval()` or `Function()` constructor usage
- No inline scripts or event handlers
- No `javascript:` URLs
- All resources from allowed domains

## Development

### Requirements

- Node.js >= 20
- pnpm >= 10

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run CSP audit
pnpm audit-csp
```

## CI/CD Integration

The bundle size check and CSP audit scripts are designed for CI pipelines:

```yaml
- name: Check bundle size
  run: pnpm check-budgets

- name: Audit CSP compliance
  run: pnpm audit-csp
```

Both scripts will exit with code 1 if violations are found, failing the CI build.
