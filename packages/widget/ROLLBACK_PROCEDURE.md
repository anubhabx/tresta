# Widget Deployment Rollback Procedure

## Overview

This document provides step-by-step instructions for rolling back a widget deployment in case of critical issues discovered in production.

## When to Rollback

Rollback should be initiated when:

- **Critical bugs** affecting core functionality are discovered
- **Performance degradation** beyond acceptable thresholds (load time >5s, error rate >5%)
- **Security vulnerabilities** are identified in the deployed version
- **Breaking changes** affecting existing customer integrations
- **High error rates** detected in monitoring (>1% sustained for >5 minutes)

## Rollback Authority

The following roles can authorize a rollback:

- On-call Engineer
- Engineering Manager
- CTO
- DevOps Lead

## Pre-Rollback Checklist

Before initiating rollback:

- [ ] Confirm the issue is with the new deployment (check deployment timestamp vs issue start time)
- [ ] Identify the last known good version
- [ ] Notify team in #engineering-alerts Slack channel
- [ ] Create incident ticket with details
- [ ] Verify rollback target version is available in CDN

## Rollback Steps

### Step 1: Identify Versions

```bash
# Current production version
CURRENT_VERSION="1.2.3"

# Last known good version
ROLLBACK_VERSION="1.2.2"

# Major version symlink
MAJOR_VERSION="1"
```

### Step 2: Verify Rollback Target Exists

```bash
# Check if rollback version exists in CDN
aws s3 ls s3://cdn.tresta.com/widget/v${ROLLBACK_VERSION}/

# Expected output should show:
# - tresta-widget.iife.js
# - tresta-widget.iife.js.gz
# - tresta-widget.iife.js.br
# - manifest.json
```

### Step 3: Update Major Version Symlink

```bash
# Copy rollback version manifest to major version path
aws s3 cp \
  s3://cdn.tresta.com/widget/v${ROLLBACK_VERSION}/manifest.json \
  s3://cdn.tresta.com/widget/v${MAJOR_VERSION}/manifest.json \
  --cache-control "public, max-age=0, s-maxage=60, stale-while-revalidate=300"

# Copy all assets
aws s3 sync \
  s3://cdn.tresta.com/widget/v${ROLLBACK_VERSION}/ \
  s3://cdn.tresta.com/widget/v${MAJOR_VERSION}/ \
  --exclude "*.map" \
  --cache-control "public, max-age=31536000, immutable"
```

### Step 4: Invalidate CDN Cache

```bash
# For CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/widget/v${MAJOR_VERSION}/*"

# For CloudFlare (using API)
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://cdn.tresta.com/widget/v'${MAJOR_VERSION}'/tresta-widget.iife.js"]}'
```

### Step 5: Verify Rollback

```bash
# Check that the correct version is being served
curl -I https://cdn.tresta.com/widget/v${MAJOR_VERSION}/tresta-widget.iife.js

# Download and verify content
curl https://cdn.tresta.com/widget/v${MAJOR_VERSION}/manifest.json | jq '.version'
# Should output: "1.2.2"
```

### Step 6: Monitor Post-Rollback

```bash
# Monitor error rates for 10 minutes
# Check monitoring dashboard: https://monitoring.tresta.com/widget-dashboard

# Expected metrics:
# - Error rate should drop below 1%
# - Load time should be <3s (p95)
# - No new errors in logs
```

### Step 7: Update Admin Panel

```bash
# Update admin panel to reflect rollback version
# This prevents new customers from getting the broken version

# SSH into admin server
ssh admin@admin.tresta.com

# Update widget version in database
psql -d tresta_production -c "UPDATE widget_versions SET is_latest = false WHERE version = '${CURRENT_VERSION}';"
psql -d tresta_production -c "UPDATE widget_versions SET is_latest = true WHERE version = '${ROLLBACK_VERSION}';"
```

## Post-Rollback Actions

After successful rollback:

1. **Update Incident Ticket**
   - Document rollback completion time
   - Add metrics showing issue resolution
   - Link to monitoring dashboards

2. **Notify Stakeholders**
   ```
   Subject: Widget Deployment Rollback Complete - v${ROLLBACK_VERSION}
   
   The widget deployment has been rolled back from v${CURRENT_VERSION} to v${ROLLBACK_VERSION}.
   
   Reason: [Brief description of issue]
   Rollback Time: [Timestamp]
   Current Status: Monitoring for stability
   
   Next Steps:
   - Root cause analysis scheduled
   - Fix will be developed and tested
   - New deployment planned after thorough validation
   ```

3. **Root Cause Analysis**
   - Schedule post-mortem meeting within 24 hours
   - Document what went wrong
   - Identify gaps in testing/deployment process
   - Create action items to prevent recurrence

4. **Fix and Redeploy**
   - Create hotfix branch from rollback version
   - Fix the issue
   - Add tests to prevent regression
   - Deploy through full CI/CD pipeline
   - Monitor closely for 24 hours

## Emergency Contacts

| Role | Contact | Phone | Slack |
|------|---------|-------|-------|
| On-Call Engineer | PagerDuty | - | @oncall |
| DevOps Lead | John Doe | +1-555-0100 | @john.doe |
| Engineering Manager | Jane Smith | +1-555-0101 | @jane.smith |
| CTO | Bob Johnson | +1-555-0102 | @bob.johnson |

## Rollback Scenarios

### Scenario 1: High Error Rate

**Symptoms:** Error rate >5% in monitoring dashboard

**Action:**
```bash
# Immediate rollback
./scripts/rollback.sh --version ${ROLLBACK_VERSION} --reason "high-error-rate"
```

### Scenario 2: Performance Degradation

**Symptoms:** Load time >5s (p95), customer complaints

**Action:**
```bash
# Rollback and enable performance monitoring
./scripts/rollback.sh --version ${ROLLBACK_VERSION} --reason "performance-degradation"
./scripts/enable-detailed-monitoring.sh
```

### Scenario 3: Security Vulnerability

**Symptoms:** Security team reports XSS or other vulnerability

**Action:**
```bash
# Immediate rollback + security audit
./scripts/rollback.sh --version ${ROLLBACK_VERSION} --reason "security-vulnerability" --urgent
./scripts/security-audit.sh --version ${CURRENT_VERSION}
```

### Scenario 4: Breaking Change

**Symptoms:** Customer reports widget not loading, console errors

**Action:**
```bash
# Rollback and notify affected customers
./scripts/rollback.sh --version ${ROLLBACK_VERSION} --reason "breaking-change"
./scripts/notify-customers.sh --affected-versions ${CURRENT_VERSION}
```

## Automated Rollback Script

For convenience, use the automated rollback script:

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ROLLBACK_VERSION=$1
REASON=$2

if [ -z "$ROLLBACK_VERSION" ]; then
  echo "Usage: ./rollback.sh <version> <reason>"
  exit 1
fi

echo "🔄 Initiating rollback to v${ROLLBACK_VERSION}"
echo "Reason: ${REASON}"

# Verify version exists
aws s3 ls s3://cdn.tresta.com/widget/v${ROLLBACK_VERSION}/ || {
  echo "❌ Version v${ROLLBACK_VERSION} not found in CDN"
  exit 1
}

# Update symlink
MAJOR_VERSION=$(echo $ROLLBACK_VERSION | cut -d. -f1)
aws s3 sync \
  s3://cdn.tresta.com/widget/v${ROLLBACK_VERSION}/ \
  s3://cdn.tresta.com/widget/v${MAJOR_VERSION}/ \
  --exclude "*.map"

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/widget/v${MAJOR_VERSION}/*"

# Verify
sleep 5
DEPLOYED_VERSION=$(curl -s https://cdn.tresta.com/widget/v${MAJOR_VERSION}/manifest.json | jq -r '.version')

if [ "$DEPLOYED_VERSION" == "$ROLLBACK_VERSION" ]; then
  echo "✅ Rollback successful to v${ROLLBACK_VERSION}"
else
  echo "❌ Rollback verification failed"
  exit 1
fi

# Notify team
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"🔄 Widget rolled back to v${ROLLBACK_VERSION}. Reason: ${REASON}\"}"

echo "🎉 Rollback complete"
```

## Testing Rollback Procedure

Rollback procedure should be tested quarterly:

```bash
# Test rollback in staging environment
ENVIRONMENT=staging ./scripts/test-rollback.sh

# Verify:
# 1. Symlink updates correctly
# 2. CDN cache invalidates
# 3. Correct version is served
# 4. Monitoring alerts work
# 5. Notifications are sent
```

## Rollback Metrics

Track these metrics for each rollback:

- **Time to Detect:** Time from deployment to issue detection
- **Time to Decide:** Time from detection to rollback decision
- **Time to Execute:** Time from decision to rollback completion
- **Time to Verify:** Time from rollback to verification
- **Total Downtime:** Total time users were affected

**Target:** Total rollback time <15 minutes

## Version History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-18 | 1.0 | DevOps Team | Initial rollback procedure |

## Related Documentation

- [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)
- [Monitoring Guide](./MONITORING_GUIDE.md)
- [Incident Response Plan](./INCIDENT_RESPONSE.md)
- [CDN Configuration](./CDN_CONFIGURATION.md)

## Appendix: AWS CLI Commands Reference

### List all widget versions in CDN
```bash
aws s3 ls s3://cdn.tresta.com/widget/ --recursive | grep manifest.json
```

### Check file integrity
```bash
aws s3api head-object \
  --bucket cdn.tresta.com \
  --key widget/v1.2.2/tresta-widget.iife.js \
  --query 'Metadata'
```

### Download specific version for inspection
```bash
aws s3 cp s3://cdn.tresta.com/widget/v1.2.2/tresta-widget.iife.js ./inspect/
```

### Compare two versions
```bash
diff <(aws s3 cp s3://cdn.tresta.com/widget/v1.2.2/manifest.json -) \
     <(aws s3 cp s3://cdn.tresta.com/widget/v1.2.3/manifest.json -)
```
