# Widget Management UI Components

This directory contains the admin panel components for managing CDN widgets.

## Components

### WidgetConfigurator
Interactive configuration panel for customizing widget appearance and behavior.

**Features:**
- Layout selection (carousel, grid, masonry, wall, list)
- Theme selection (light, dark, auto)
- Color picker for primary and secondary colors
- Card style options (default, minimal, bordered)
- Display options toggles (rating, date, avatar, role, company)
- Max testimonials slider
- Carousel-specific settings (auto-rotate, interval, navigation)
- Grid-specific settings (columns)

**Usage:**
```tsx
import { WidgetConfigurator } from '@/components/widgets/widget-configurator';

<WidgetConfigurator 
  config={widgetConfig} 
  onChange={setWidgetConfig} 
/>
```

### WidgetPreview
Live iframe-based preview of the widget with current configuration.

**Features:**
- Real-time preview updates
- Mock testimonial data
- Isolated rendering in iframe
- Responsive preview
- Theme-aware rendering

**Usage:**
```tsx
import { WidgetPreview } from '@/components/widgets/widget-preview';

<WidgetPreview 
  widgetId="preview" 
  config={widgetConfig} 
/>
```

### EmbedCodeGenerator
Generates embed code snippets with copy-to-clipboard functionality.

**Features:**
- Standard embed code
- CSP-friendly embed code with SRI hashes
- Version pinning options (exact, major, latest)
- Copy to clipboard
- CSP requirements documentation

**Usage:**
```tsx
import { EmbedCodeGenerator } from '@/components/widgets/embed-code-generator';

<EmbedCodeGenerator 
  widgetId={widgetId}
  version="1.0.0"
  integrity="sha384-..."
/>
```

## Pages

### /dashboard/projects/[id]/widgets
Main widget management page for a project.

**Features:**
- List all widgets for a project
- Create new widgets with live preview
- View widget statistics (impressions, clicks)
- Get embed code for existing widgets
- Delete widgets
- Tabbed interface (Configure, Preview, Embed Code)

### /dashboard/projects/[id]/settings
Project settings page including telemetry configuration.

**Features:**
- Telemetry mode selection (off, sampled, opt-in)
- Sampling rate configuration
- Privacy information display

## Hooks

### useWidgets
React Query hook for fetching widgets.

```tsx
const { data: widgets, isLoading } = useWidgets(projectId);
```

### useWidget
React Query hook for fetching a single widget.

```tsx
const { data: widget } = useWidget(widgetId);
```

### useCreateWidget
Mutation hook for creating widgets.

```tsx
const createWidget = useCreateWidget();
await createWidget.mutateAsync({
  projectId,
  name: 'Homepage Widget',
  type: 'embed',
  config: widgetConfig
});
```

### useUpdateWidget
Mutation hook for updating widgets.

```tsx
const updateWidget = useUpdateWidget(widgetId);
await updateWidget.mutateAsync({
  config: updatedConfig
});
```

### useDeleteWidget
Mutation hook for deleting widgets.

```tsx
const deleteWidget = useDeleteWidget();
await deleteWidget.mutateAsync(widgetId);
```

## Implementation Notes

### Requirements Fulfilled

This implementation fulfills the following requirements from task 18:

1. ✅ **Widget creation form with configuration options**
   - Comprehensive configurator with all widget settings
   - Layout, theme, colors, display options, and layout-specific settings

2. ✅ **Layout selector with live preview (iframe-based)**
   - Real-time iframe preview that updates as configuration changes
   - Mock testimonial data for realistic preview

3. ✅ **Theme customizer (colors, fonts, card styles) with color picker**
   - Color picker inputs for primary and secondary colors
   - Card style selection (default, minimal, bordered)
   - Theme mode selection (light, dark, auto)

4. ✅ **Embed code generator with copy-to-clipboard functionality**
   - Standard and CSP-friendly embed code options
   - One-click copy to clipboard
   - Version pinning options

5. ✅ **CSP-friendly embed code option with SRI hashes**
   - Generates embed code with integrity hashes
   - Includes crossorigin attribute
   - Documents required CSP directives

6. ✅ **Version pinning selector (exact version vs auto-update)**
   - Three options: exact version, major version, latest
   - Clear warnings about auto-update implications
   - Recommends exact version for production

7. ✅ **Telemetry settings per account (off/sampled/opt-in)**
   - Dedicated telemetry settings component
   - Three modes: off, sampled (with rate control), opt-in
   - Privacy information and data retention policy
   - Sampling rate slider for fine-tuned control

### Design Decisions

1. **Iframe-based Preview**: Uses iframe for complete isolation and accurate rendering
2. **Mock Data**: Preview uses mock testimonials to show realistic widget appearance
3. **Tabbed Interface**: Separates configuration, preview, and embed code for better UX
4. **Real-time Updates**: Configuration changes immediately reflect in preview
5. **Responsive Design**: All components work on mobile and desktop
6. **Dark Mode Support**: Full dark mode support throughout

### Future Enhancements

- Widget analytics dashboard integration
- A/B testing configuration
- Custom CSS injection
- Widget templates/presets
- Bulk widget operations
- Widget duplication
- Version history and rollback
