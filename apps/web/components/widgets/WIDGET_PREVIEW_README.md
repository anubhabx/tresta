# Widget Preview Integration

## Overview

The Widget Preview component provides real-time visualization of widget configuration changes in the dashboard.

## Setup

### 1. Build the Widget

Before the preview will work, you need to build the widget package:

```bash
cd packages/widget
pnpm build
```

### 2. Copy Widget to Public Folder

The widget files need to be accessible from Next.js:

```bash
# From monorepo root
cp -r packages/widget/dist/* apps/web/public/widget/
```

Or on Windows PowerShell:

```powershell
Copy-Item packages\widget\dist\* -Destination apps\web\public\widget\ -Recurse -Force
```

## Usage

The `WidgetPreview` component is automatically integrated into the widget form:

```tsx
import { WidgetPreview } from "@/components/widgets/widget-preview";

<WidgetPreview
  config={formValues}
  widgetId={widget?.id}
  testimonials={testimonials}
/>;
```

## Features

- **Real-time Updates**: Preview updates automatically as form values change
- **Mock Data**: Uses sample testimonials if none provided
- **Error Handling**: Shows helpful errors if widget library isn't built
- **Responsive**: Adapts to all screen sizes
- **All Layouts**: Supports carousel, grid, masonry, wall, and list layouts

## Configuration

The preview accepts these props:

- `config`: WidgetFormData - Current form values
- `widgetId`: string (optional) - Widget ID for tracking
- `testimonials`: array (optional) - Actual testimonials to display

## Troubleshooting

### Widget not loading?

1. Make sure you've built the widget: `cd packages/widget && pnpm build`
2. Copy the build to public folder (see Setup above)
3. Check browser console for errors

### Preview not updating?

The preview uses React's `useEffect` with dependencies on the config object. Make sure you're passing the watched form values:

```tsx
const watchedValues = form.watch();
<WidgetPreview config={watchedValues} />;
```

## Development Workflow

1. Make changes to widget code in `packages/widget/src/`
2. Rebuild: `cd packages/widget && pnpm build`
3. Copy to public: `cp -r packages/widget/dist/* apps/web/public/widget/`
4. Refresh browser - preview will load new widget code

## Automation

Consider adding a script to automate the copy step:

```json
// apps/web/package.json
{
  "scripts": {
    "copy-widget": "cp -r ../../packages/widget/dist/* public/widget/"
  }
}
```

Then run: `pnpm copy-widget` after building the widget.
