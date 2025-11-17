# CI/CD Pipeline Setup - Implementation Summary

## Overview

This document summarizes the CI/CD pipeline implementation for the Tresta Widget System. The pipeline automates testing, building, and deployment with comprehensive quality gates and rollback procedures.

## What Was Implemented

### 1. GitHub Actions Workflow (`.github/workflows/widget-ci-cd.yml`)

A complete CI/CD pipeline with three sequential jobs:

#### Test Job
- Runs unit tests with Vitest
- Runs E2E tests with Playwright (when available)
- Uploads test results as artifacts
- **Gates deployment:** Build job only runs if tests pass

#### Build Job
- Builds production bundle with Vite
- Checks bundle size budgets (fails if exceeded)
- Generates SHA-384 integrity hashes for SRI
- Creates release manifest with version info
- Precompresses assets (gzip + Brotli)
- Uploads build artifacts (separate from source maps)
- Uploads source maps to private storage
- **Gates deployment:** Deploy job only runs if build passes

#### Deploy Job
- Downloads build artifacts
- Implements canary deployment (versioned path first)
- Uploads source maps to private S3
- Runs smoke tests and monitors error rates
- Promotes to production (updates major version symlink)
- Creates GitHub release
- **Only runs:** On push to main branch

### 2. Bundle Budget Checker (`packages/widget/scripts/check-bundle-budgets.js`)

Already existed, now integrated into CI pipeline:
- Core bundle: 50KB target, 100KB hard limit
- Layout chunks: 12KB each
- Total bundle: 100KB maximum
- **CI fails** if budgets exceeded

### 3. Manifest Generator (`packages/widget/scripts/generate-manifest.js`)

Generates `dist/manifest.json` containing:
- Version number
- All asset files with sizes and integrity hashes
- CDN URLs (versioned and major version)
- Embed code templates (standard and CSP-friendly)
- Build timestamp

**Example manifest:**
```json
{
  "version": "1.0.0",
  "buildTime": "2025-11-17T18:57:37.884Z",
  "assets": {
    "tresta-widget.iife.js": {
      "integrity": "sha384-...",
      "size": 63897,
      "type": "script"
    }
  },
  "cdn": {
    "versionedUrl": "https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js",
    "majorVersionUrl": "https://cdn.tresta.com/widget/v1/tresta-widget.iife.js"
  },
  "embedCode": {
    "standard": "<!-- embed code -->",
    "cspFriendly": "<!-- embed code with SRI -->"
  }
}
```

### 4. Rollback Procedure (`packages/widget/ROLLBACK_PROCEDURE.md`)

Comprehensive documentation including:
- When to rollback (error rates, performance, security)
- Who can authorize rollback
- Step-by-step rollback instructions
- AWS CLI commands for S3 and CloudFront
- Post-rollback actions and monitoring
- Emergency contact information
- Rollback scenarios with examples

### 5. Automated Rollback Script (`packages/widget/scripts/rollback.sh`)

Bash script for quick rollback execution:
```bash
./rollback.sh 1.2.2 "high-error-rate" --urgent
```

Features:
- Verifies target version exists
- Backs up current version info
- Updates major version symlink
- Invalidates CDN cache
- Verifies rollback success
- Sends Slack notifications
- Creates audit trail

## How to Use

### Running Locally

```bash
# Build widget
pnpm --filter @workspace/widget build

# Check bundle budgets
pnpm --filter @workspace/widget check-budgets

# Generate manifest
cd packages/widget
node scripts/generate-manifest.js

# View manifest
cat dist/manifest.json
```

### CI/CD Pipeline

The pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Only when widget files change

**Pipeline Flow:**
1. Test → 2. Build → 3. Deploy (main only)

### Deployment

**Automatic (via CI/CD):**
- Push to `main` branch triggers full pipeline
- Tests must pass
- Bundle budgets must be met
- Canary deployment with health checks
- Automatic promotion to production

**Manual Rollback:**
```bash
cd packages/widget/scripts
./rollback.sh <version> <reason> [--urgent]

# Example
./rollback.sh 1.2.2 "high-error-rate" --urgent
```

## Configuration Required

### GitHub Secrets

Add these secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID          # For S3/CloudFront access
AWS_SECRET_ACCESS_KEY      # For S3/CloudFront access
SLACK_WEBHOOK_URL          # For deployment notifications (optional)
```

### Environment Variables

Set these in the workflow or as repository variables:

```
CDN_BUCKET                 # S3 bucket name (default: cdn.tresta.com)
CLOUDFRONT_DISTRIBUTION_ID # CloudFront distribution ID
AWS_REGION                 # AWS region (default: us-east-1)
```

### AWS Permissions

The AWS credentials need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::cdn.tresta.com/*",
        "arn:aws:s3:::tresta-private/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## Quality Gates

The pipeline enforces these quality gates:

### 1. Test Gate
- ✅ All unit tests must pass
- ✅ All E2E tests must pass (when available)
- ❌ Build fails if any test fails

### 2. Bundle Size Gate
- ✅ Core bundle ≤ 50KB (target) or ≤ 100KB (max)
- ✅ Layout chunks ≤ 12KB each
- ✅ Total bundle ≤ 100KB
- ❌ Build fails if budgets exceeded

### 3. Build Gate
- ✅ TypeScript compilation succeeds
- ✅ Vite build completes
- ✅ All assets generated (JS, CSS, compressed)
- ❌ Deploy blocked if build fails

### 4. Deployment Gate
- ✅ Smoke tests pass on canary
- ✅ Error rates within acceptable range
- ✅ Health checks pass
- ❌ Promotion blocked if checks fail

## Monitoring

### Build Artifacts

Available in GitHub Actions:
- `widget-build-{version}` - Production bundle
- `widget-sourcemaps-{version}` - Source maps (private)
- `bundle-analysis` - Bundle size visualization
- `test-results` - Test reports

Retention:
- Build artifacts: 30 days
- Source maps: 90 days
- Test results: 7 days

### Deployment Tracking

Each deployment creates:
- GitHub release with version tag
- Release manifest in S3
- Rollback backup record
- Slack notification (if configured)

## Canary Deployment

The pipeline implements a canary rollout strategy:

1. **Upload to versioned path** (`v1.2.3`)
2. **Run smoke tests** (validate bundle loads)
3. **Monitor error rates** (check for anomalies)
4. **Promote to production** (update `v1` symlink)

If any step fails, deployment stops and rollback is recommended.

## Rollback Process

### Quick Rollback
```bash
./scripts/rollback.sh 1.2.2 "high-error-rate" --urgent
```

### Manual Rollback
```bash
# 1. Verify target version
aws s3 ls s3://cdn.tresta.com/widget/v1.2.2/

# 2. Update symlink
aws s3 sync \
  s3://cdn.tresta.com/widget/v1.2.2/ \
  s3://cdn.tresta.com/widget/v1/ \
  --exclude "*.map"

# 3. Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/widget/v1/*"

# 4. Verify
curl https://cdn.tresta.com/widget/v1/manifest.json | jq '.version'
```

## Testing the Pipeline

### Local Testing
```bash
# Run all checks locally
pnpm --filter @workspace/widget test
pnpm --filter @workspace/widget build
pnpm --filter @workspace/widget check-budgets
node packages/widget/scripts/generate-manifest.js
```

### CI Testing
- Create a pull request to trigger test and build jobs
- Merge to `main` to trigger full pipeline including deploy

### Rollback Testing
```bash
# Test in staging environment
ENVIRONMENT=staging ./scripts/rollback.sh 1.0.0 "testing"
```

## Troubleshooting

### Build Fails - Bundle Size Exceeded
```bash
# Analyze bundle
pnpm --filter @workspace/widget run analyze

# Check what's large
ls -lh packages/widget/dist/*.gz

# Optimize imports, enable tree-shaking
```

### Deploy Fails - AWS Credentials
```bash
# Verify credentials are set
echo $AWS_ACCESS_KEY_ID

# Test S3 access
aws s3 ls s3://cdn.tresta.com/widget/
```

### Rollback Fails - Version Not Found
```bash
# List available versions
aws s3 ls s3://cdn.tresta.com/widget/ | grep "PRE v"

# Use an existing version
./scripts/rollback.sh <existing-version> "reason"
```

## Next Steps

1. **Configure GitHub Secrets** - Add AWS credentials and Slack webhook
2. **Test Pipeline** - Create a PR to test the workflow
3. **Set Up Monitoring** - Configure error tracking and performance monitoring
4. **Document Runbook** - Add team-specific procedures and contacts
5. **Train Team** - Ensure team knows how to use rollback procedures

## Related Documentation

- [Rollback Procedure](./ROLLBACK_PROCEDURE.md) - Detailed rollback instructions
- [GitHub Actions Workflow](../../.github/workflows/widget-ci-cd.yml) - Pipeline configuration
- [Bundle Budget Checker](./scripts/check-bundle-budgets.js) - Budget enforcement
- [Manifest Generator](./scripts/generate-manifest.js) - Release manifest creation

## Support

For issues with the CI/CD pipeline:
- Check GitHub Actions logs
- Review [Rollback Procedure](./ROLLBACK_PROCEDURE.md)
- Contact DevOps team in #devops Slack channel
- Create incident ticket for production issues
