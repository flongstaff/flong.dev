#!/bin/bash

# Query Analytics Script for flong.dev
# Usage: ./query-analytics.sh [query_type]

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Error: CLOUDFLARE_ACCOUNT_ID environment variable is not set"
  echo "Please set it with: export CLOUDFLARE_ACCOUNT_ID=\"your_account_id\""
  exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN environment variable is not set"
  echo "Please set it with: export CLOUDFLARE_API_TOKEN=\"your_api_token\""
  exit 1
fi

ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"
API_TOKEN="$CLOUDFLARE_API_TOKEN"
DATASET="flong_dev_metrics"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Querying Analytics Engine for flong.dev${NC}\n"

# Default query type
QUERY_TYPE="${1:-summary}"

case $QUERY_TYPE in
  summary)
    QUERY="SELECT
      blob1 AS endpoint,
      blob2 AS method,
      COUNT() AS requests,
      AVG(double1) AS avg_response_time,
      SUM(double2) AS successful_requests,
      SUM(double3) AS rate_limited_requests
    FROM ${DATASET}
    WHERE timestamp > NOW() - INTERVAL '24' HOUR
    GROUP BY endpoint, method
    ORDER BY requests DESC
    LIMIT 20"
    ;;
    
  contact)
    QUERY="SELECT
      blob2 AS project_type,
      blob3 AS has_company,
      blob4 AS email_status,
      blob5 AS country,
      COUNT() AS submissions,
      AVG(double2) AS avg_message_length,
      SUM(double3) AS successful_emails
    FROM ${DATASET}
    WHERE blob1 = 'contact_form'
      AND timestamp > NOW() - INTERVAL '7' DAY
    GROUP BY project_type, has_company, email_status, country
    ORDER BY submissions DESC"
    ;;
    
  countries)
    QUERY="SELECT
      blob3 AS country,
      COUNT() AS requests,
      AVG(double1) AS avg_response_time
    FROM ${DATASET}
    WHERE timestamp > NOW() - INTERVAL '24' HOUR
    GROUP BY country
    ORDER BY requests DESC
    LIMIT 10"
    ;;
    
  errors)
    QUERY="SELECT
      blob1 AS endpoint,
      blob4 AS status,
      COUNT() AS error_count,
      AVG(double1) AS avg_response_time
    FROM ${DATASET}
    WHERE double2 = 0
      AND timestamp > NOW() - INTERVAL '24' HOUR
    GROUP BY endpoint, status
    ORDER BY error_count DESC"
    ;;
    
  performance)
    QUERY="SELECT
      blob1 AS endpoint,
      COUNT() AS requests,
      AVG(double1) AS avg_ms,
      MIN(double1) AS min_ms,
      MAX(double1) AS max_ms
    FROM ${DATASET}
    WHERE timestamp > NOW() - INTERVAL '1' HOUR
    GROUP BY endpoint
    ORDER BY avg_ms DESC"
    ;;
    
  *)
    echo "Unknown query type: $QUERY_TYPE"
    echo "Available types: summary, contact, countries, errors, performance"
    exit 1
    ;;
esac

echo -e "${GREEN}Query: ${QUERY_TYPE}${NC}\n"

# Execute query using Cloudflare API
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -d "${QUERY}" | jq .

echo -e "\n${BLUE}Query completed!${NC}"
