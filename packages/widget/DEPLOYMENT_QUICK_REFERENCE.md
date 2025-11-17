# Widget Deployment - Quick Reference

## 🚀 Normal Deployment

**Automatic via CI/CD:**
```bash
# 1. Merge PR to main
git checkout main
git pull origin main

# 2. Pipeline runs automatically
# - Tests run
# - Build creates bundle
# - Bundle size checked
# - Manifest generated
# - Deployed to CDN
# - GitHub release created

# 3. Monitor deployment
# Check: https://github.com/your-org/tresta/actions
```

## 🔄 Rollback

**Quick rollback:**
```bash
cd packages/widget/scripts
./rollback.sh 1.2.2 "high-error-rate" --urgent
```

**Manual rollback:**
```bash
# Update major version symlink
aws s3 sync \
  s3://cdn.tresta.com/widget/v1.2.2/ \
  s3://cdn.tresta.com/widget/v1/ \
  --exclude "*.map"

# Invalidate CDN cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/widget/v1/*"
```

## 📊 Check Status

**Current version:**
```bash
curl https://cdn.tresta.com/widget/v1/manifest.json | jq '.version'
```

**Bundle size:**
```bash
cd packages/widget
pnpm run check-budgets
```

**Available versions:**
```bash
aws s3 ls s3://cdn.tresta.com/widget/ | grep "PRE v"
```

## 🧪 Local Testing

```bash
# Build
pnpm --filter @workspace/widget build

# Test
pnpm --filter @workspace/widget test

# Check budgets
pnpm --filter @workspace/widget check-budgets

# Generate manifest
cd packages/widget
node scripts/generate-manifest.js
```

## 📦 Build Artifacts

**Locations:**
- Production bundle: `packages/widget/dist/`
- Manifest: `packages/widget/dist/manifest.json`
- Source maps: `packages/widget/dist/*.map` (not deployed to public CDN)

**CDN URLs:**
- Versioned: `https://cdn.tresta.com/widget/v1.2.3/tresta-widget.iife.js`
- Major version: `https://cdn.tresta.com/widget/v1/tresta-widget.iife.js`
- Latest: `https://cdn.tresta.com/widget/latest/tresta-widget.iife.js`

## ⚠️ When to Rollback

- Error rate >5%
- Load time >5s (p95)
- Security vulnerability
- Breaking changes
- Customer complaints

## 📞 Emergency Contacts

- On-Call: PagerDuty / @oncall
- DevOps: @devops-team
- Engineering Manager: @eng-manager

## 🔗 Links

- [Full Rollback Procedure](./ROLLBACK_PROCEDURE.md)
- [CI/CD Setup Guide](./CI_CD_SETUP.md)
- [GitHub Actions](https://github.com/your-org/tresta/actions)
- [Monitoring Dashboard](https://monitoring.tresta.com/widget-dashboard)
