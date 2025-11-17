# Widget Analytics Dashboard

## Overview

The Widget Analytics Dashboard provides comprehensive monitoring and performance tracking for CDN-delivered testimonial widgets. It enables project owners to monitor widget performance, identify issues, and optimize user experience.

## Features

### 1. Widget Load Metrics
- **Total Loads**: Track the number of times widgets are loaded across all websites
- **Success Rate**: Monitor successful vs failed widget loads
- **Error Rate**: Track error percentage with alerts when exceeding 1% threshold
- **Load Time Performance**: 
  - Average load time
  - p50, p95, p99 percentiles
  - Alerts when average load time exceeds 3000ms

### 2. Time-Based Analytics
- **7/30/90 Day Views**: Analyze widget performance over different time periods
- **Daily Load Trends**: Line charts showing total, successful, and failed loads over time
- **Historical Comparison**: Compare performance across different time periods

### 3. Browser & Device Breakdown
- **Browser Distribution**: Pie charts showing widget loads by browser (Chrome, Firefox, Safari, Edge, etc.)
- **Device Distribution**: Breakdown by device type (desktop, mobile, tablet)
- **Percentage Analysis**: View both count and percentage for each category

### 4. Geographic Distribution
- **Country-Level Analytics**: Top 10 countries by widget loads
- **Visual Progress Bars**: Easy-to-read visualization of geographic distribution
- **Load Count & Percentage**: Detailed metrics for each country

### 5. Real-Time Monitoring
- **Last 5 Minutes View**: Live monitoring of widget activity
- **Current Metrics**:
  - Total loads in last 5 minutes
  - Error count
  - Error rate
  - Average load time
- **Recent Errors**: List of most recent errors with details (error code, browser, device, timestamp)
- **Auto-Refresh**: Updates every 30 seconds

### 6. Performance Alerts
- **Automated Monitoring**: Background jobs check performance every 15 minutes
- **Alert Types**:
  - **Load Time Exceeded**: Triggered when average load time > 3000ms
  - **Error Rate Exceeded**: Triggered when error rate > 1%
- **Severity Levels**:
  - **WARNING**: Minor threshold violations
  - **CRITICAL**: Severe performance issues
- **Alert Management**: Resolve alerts when issues are fixed
- **Alert History**: View both active and resolved alerts

## API Endpoints

### Telemetry Tracking (Public)
```
POST /api/widget-analytics/track
```
Records widget load events. No authentication required.

**Request Body:**
```json
{
  "widgetId": "widget_123",
  "projectId": "project_456",
  "loadTime": 1250,
  "layoutType": "grid",
  "browser": "Chrome",
  "device": "desktop",
  "country": "US",
  "errorCode": null,
  "version": "1.2.3"
}
```

### Get Widget Analytics (Protected)
```
GET /api/widget-analytics/:widgetId?days=30
```
Retrieves analytics data for a specific widget.

**Query Parameters:**
- `days`: Number of days to retrieve (1-90, default: 30)

**Response:**
```json
{
  "widget": {
    "id": "widget_123",
    "projectId": "project_456",
    "projectName": "My Project"
  },
  "period": {
    "days": 30,
    "startDate": "2025-10-18T00:00:00Z",
    "endDate": "2025-11-17T00:00:00Z"
  },
  "metrics": {
    "totalLoads": 15420,
    "successfulLoads": 15350,
    "failedLoads": 70,
    "errorRate": 0.45,
    "loadTime": {
      "avg": 1250,
      "p50": 1100,
      "p95": 2200,
      "p99": 3100
    }
  },
  "breakdown": {
    "browsers": [...],
    "devices": [...],
    "countries": [...]
  },
  "dailyLoads": [...]
}
```

### Get Real-Time Analytics (Protected)
```
GET /api/widget-analytics/:widgetId/realtime
```
Retrieves real-time analytics for the last 5 minutes.

### Get Performance Alerts (Protected)
```
GET /api/widget-analytics/:widgetId/alerts?resolved=false
```
Retrieves performance alerts for a widget.

**Query Parameters:**
- `resolved`: Include resolved alerts (true/false, default: false)

### Resolve Performance Alert (Protected)
```
PATCH /api/widget-analytics/alerts/:alertId/resolve
```
Marks a performance alert as resolved.

## Background Jobs

### Performance Check Job
- **Schedule**: Every 15 minutes
- **Function**: Checks all widgets for performance issues
- **Actions**:
  - Calculates error rate and average load time for the last hour
  - Creates alerts if thresholds are exceeded
  - Prevents duplicate alerts within the same hour

### Analytics Cleanup Job
- **Schedule**: Daily at 2:00 AM UTC
- **Function**: Removes analytics data older than 90 days
- **Purpose**: Maintains database performance and complies with data retention policy

## Usage

### Accessing the Dashboard

1. Navigate to `/dashboard/analytics` in the admin panel
2. Select a widget from the list of available widgets
3. Choose a time period (7, 30, or 90 days)
4. View comprehensive analytics and performance metrics

### Monitoring Performance

1. **Check Real-Time Monitor**: View current widget activity and recent errors
2. **Review Performance Alerts**: Address any active alerts
3. **Analyze Trends**: Use the load trends chart to identify patterns
4. **Investigate Issues**: Use browser/device breakdown to identify problematic platforms
5. **Geographic Analysis**: Understand where your widgets are being used

### Responding to Alerts

1. **Review Alert Details**: Check the alert message, threshold, and actual value
2. **Investigate Root Cause**: Use analytics data to identify the issue
3. **Take Action**: Optimize widget code, CDN configuration, or API performance
4. **Resolve Alert**: Mark the alert as resolved once the issue is fixed

## Data Retention

- **Analytics Data**: Retained for 90 days
- **Performance Alerts**: Retained indefinitely (can be filtered by resolved status)
- **Automatic Cleanup**: Old analytics data is automatically deleted daily

## Privacy & Compliance

- **No PII Collection**: Widget analytics do not collect personally identifiable information
- **Sampling**: Telemetry is sampled at 1% by default (configurable per account)
- **DNT Respect**: Respects Do Not Track browser settings
- **Opt-Out**: Users can disable telemetry via `data-telemetry="false"` attribute

## Performance Considerations

- **Telemetry Endpoint**: High rate limit (1000 req/min) to handle widget loads
- **Analytics Queries**: Optimized with database indexes on widgetId and timestamp
- **Real-Time Updates**: Auto-refresh every 30 seconds to balance freshness and load
- **Data Aggregation**: Metrics are calculated on-demand for flexibility

## Troubleshooting

### No Data Showing
- Verify the widget is embedded and receiving traffic
- Check that telemetry is enabled (not disabled via `data-telemetry="false"`)
- Ensure the widget version includes telemetry tracking

### High Error Rate
- Check the Recent Errors section in Real-Time Monitor
- Review browser/device breakdown to identify problematic platforms
- Verify API endpoint availability and response times
- Check CDN configuration and cache headers

### Slow Load Times
- Review the load time percentiles (p95, p99)
- Check CDN cache hit rates
- Optimize widget bundle size
- Review API response times
- Consider geographic distribution and CDN edge locations

## Future Enhancements

- Heatmaps showing widget interaction patterns
- Conversion attribution tracking
- A/B testing support for widget variants
- Custom dashboard views and saved filters
- Email notifications for critical alerts
- Integration with external monitoring tools (Datadog, New Relic, etc.)
