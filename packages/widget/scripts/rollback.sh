#!/bin/bash

###############################################################################
# Widget Deployment Rollback Script
#
# Usage: ./rollback.sh <version> <reason> [--urgent]
#
# Example: ./rollback.sh 1.2.2 "high-error-rate" --urgent
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
ROLLBACK_VERSION=$1
REASON=$2
URGENT=$3

# Configuration
CDN_BUCKET="${CDN_BUCKET:-cdn.tresta.com}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E1234567890ABC}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Validation
if [ -z "$ROLLBACK_VERSION" ]; then
  echo -e "${RED}❌ Error: Version not specified${NC}"
  echo "Usage: ./rollback.sh <version> <reason> [--urgent]"
  echo "Example: ./rollback.sh 1.2.2 'high-error-rate' --urgent"
  exit 1
fi

if [ -z "$REASON" ]; then
  echo -e "${RED}❌ Error: Reason not specified${NC}"
  echo "Usage: ./rollback.sh <version> <reason> [--urgent]"
  exit 1
fi

# Extract major version
MAJOR_VERSION=$(echo $ROLLBACK_VERSION | cut -d. -f1)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Widget Deployment Rollback Procedure              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Target Version:${NC} v${ROLLBACK_VERSION}"
echo -e "${YELLOW}Reason:${NC} ${REASON}"
echo -e "${YELLOW}Urgency:${NC} ${URGENT:-normal}"
echo -e "${YELLOW}Major Version:${NC} v${MAJOR_VERSION}"
echo ""

# Confirmation prompt (skip if --urgent flag is set)
if [ "$URGENT" != "--urgent" ]; then
  read -p "Are you sure you want to rollback to v${ROLLBACK_VERSION}? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Rollback cancelled${NC}"
    exit 0
  fi
fi

echo ""
echo -e "${BLUE}[1/7] Verifying rollback target exists...${NC}"

# Check if version exists in S3
if aws s3 ls s3://${CDN_BUCKET}/widget/v${ROLLBACK_VERSION}/ > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Version v${ROLLBACK_VERSION} found in CDN${NC}"
else
  echo -e "${RED}❌ Version v${ROLLBACK_VERSION} not found in CDN${NC}"
  echo "Available versions:"
  aws s3 ls s3://${CDN_BUCKET}/widget/ | grep "PRE v" | awk '{print $2}'
  exit 1
fi

echo ""
echo -e "${BLUE}[2/7] Backing up current version...${NC}"

# Get current version
CURRENT_VERSION=$(aws s3 cp s3://${CDN_BUCKET}/widget/v${MAJOR_VERSION}/manifest.json - 2>/dev/null | jq -r '.version' || echo "unknown")
echo -e "${YELLOW}Current version: v${CURRENT_VERSION}${NC}"

# Create backup record
BACKUP_FILE="/tmp/widget-rollback-backup-$(date +%Y%m%d-%H%M%S).json"
cat > $BACKUP_FILE <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "previous_version": "${CURRENT_VERSION}",
  "rollback_version": "${ROLLBACK_VERSION}",
  "reason": "${REASON}",
  "performed_by": "${USER}",
  "hostname": "$(hostname)"
}
EOF
echo -e "${GREEN}✅ Backup record created: ${BACKUP_FILE}${NC}"

echo ""
echo -e "${BLUE}[3/7] Updating major version symlink...${NC}"

# Sync rollback version to major version path
aws s3 sync \
  s3://${CDN_BUCKET}/widget/v${ROLLBACK_VERSION}/ \
  s3://${CDN_BUCKET}/widget/v${MAJOR_VERSION}/ \
  --exclude "*.map" \
  --cache-control "public, max-age=31536000, immutable" \
  --quiet

echo -e "${GREEN}✅ Major version v${MAJOR_VERSION} updated to v${ROLLBACK_VERSION}${NC}"

echo ""
echo -e "${BLUE}[4/7] Invalidating CDN cache...${NC}"

# Create CloudFront invalidation
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --paths "/widget/v${MAJOR_VERSION}/*" \
  --query 'Invalidation.Id' \
  --output text 2>/dev/null || echo "")

if [ -n "$INVALIDATION_ID" ]; then
  echo -e "${GREEN}✅ CDN cache invalidation created: ${INVALIDATION_ID}${NC}"
  echo -e "${YELLOW}   Waiting for invalidation to complete...${NC}"
  
  # Wait for invalidation (with timeout)
  TIMEOUT=60
  ELAPSED=0
  while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(aws cloudfront get-invalidation \
      --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
      --id ${INVALIDATION_ID} \
      --query 'Invalidation.Status' \
      --output text 2>/dev/null || echo "Unknown")
    
    if [ "$STATUS" == "Completed" ]; then
      echo -e "${GREEN}✅ Cache invalidation completed${NC}"
      break
    fi
    
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo -n "."
  done
  echo ""
else
  echo -e "${YELLOW}⚠️  Could not create cache invalidation (may need manual intervention)${NC}"
fi

echo ""
echo -e "${BLUE}[5/7] Verifying rollback...${NC}"

# Wait a moment for CDN to propagate
sleep 5

# Verify deployed version
DEPLOYED_VERSION=$(curl -s https://${CDN_BUCKET}/widget/v${MAJOR_VERSION}/manifest.json | jq -r '.version' 2>/dev/null || echo "unknown")

if [ "$DEPLOYED_VERSION" == "$ROLLBACK_VERSION" ]; then
  echo -e "${GREEN}✅ Rollback verified: v${DEPLOYED_VERSION}${NC}"
else
  echo -e "${RED}❌ Rollback verification failed${NC}"
  echo -e "${YELLOW}   Expected: v${ROLLBACK_VERSION}${NC}"
  echo -e "${YELLOW}   Got: v${DEPLOYED_VERSION}${NC}"
  echo -e "${YELLOW}   Note: CDN propagation may take a few minutes${NC}"
fi

echo ""
echo -e "${BLUE}[6/7] Checking health metrics...${NC}"

# Simple health check
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${CDN_BUCKET}/widget/v${MAJOR_VERSION}/tresta-widget.iife.js)

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "${GREEN}✅ Widget bundle is accessible (HTTP ${HTTP_STATUS})${NC}"
else
  echo -e "${RED}❌ Widget bundle returned HTTP ${HTTP_STATUS}${NC}"
fi

echo ""
echo -e "${BLUE}[7/7] Notifying team...${NC}"

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  SLACK_MESSAGE=$(cat <<EOF
{
  "text": "🔄 *Widget Deployment Rollback*",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔄 Widget Deployment Rollback"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*From Version:*\nv${CURRENT_VERSION}"
        },
        {
          "type": "mrkdwn",
          "text": "*To Version:*\nv${ROLLBACK_VERSION}"
        },
        {
          "type": "mrkdwn",
          "text": "*Reason:*\n${REASON}"
        },
        {
          "type": "mrkdwn",
          "text": "*Performed By:*\n${USER}@$(hostname)"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Status:* Rollback completed. Please monitor error rates and performance metrics."
      }
    }
  ]
}
EOF
)

  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "$SLACK_MESSAGE" \
    --silent > /dev/null

  echo -e "${GREEN}✅ Team notified via Slack${NC}"
else
  echo -e "${YELLOW}⚠️  Slack webhook not configured (set SLACK_WEBHOOK_URL)${NC}"
fi

# Save backup record to S3
aws s3 cp $BACKUP_FILE s3://${CDN_BUCKET}/widget-rollback-logs/$(basename $BACKUP_FILE) --quiet 2>/dev/null || true

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Rollback Completed Successfully               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Monitor error rates: https://monitoring.tresta.com/widget-dashboard"
echo "  2. Check customer reports: https://support.tresta.com"
echo "  3. Schedule post-mortem: https://calendar.tresta.com"
echo "  4. Update incident ticket with rollback details"
echo ""
echo -e "${YELLOW}Rollback Details:${NC}"
echo "  Previous Version: v${CURRENT_VERSION}"
echo "  Current Version:  v${ROLLBACK_VERSION}"
echo "  Backup Record:    ${BACKUP_FILE}"
echo "  CDN URL:          https://${CDN_BUCKET}/widget/v${MAJOR_VERSION}/tresta-widget.iife.js"
echo ""
echo -e "${BLUE}To revert this rollback, run:${NC}"
echo "  ./rollback.sh ${CURRENT_VERSION} 'reverting-rollback'"
echo ""
