# Analytics Setup for flong.dev

## Overview

This project uses **Cloudflare Analytics Engine** to track custom metrics and analytics from the worker.

## Metrics Tracked

### 1. Request Metrics (All Endpoints)
- **Endpoint**: Which API route was called
- **Method**: HTTP method (GET, POST, etc.)
- **Country**: Geographic location of request
- **Status**: HTTP status code
- **User Agent**: Browser/client information
- **Response Time**: Time taken to process request (ms)
- **Success Rate**: Whether request was successful
- **Rate Limits**: Whether request was rate limited

### 2. Contact Form Metrics
- **Project Type**: Type of inquiry (general, infrastructure, etc.)
- **Company Info**: Whether company name was provided
- **Email Status**: Whether email was sent successfully
- **Country**: Geographic location
- **Message Length**: Character count of message
- **Email Domain**: Domain of sender email

## Data Structure

### Request Analytics
```javascript
{
  blobs: [endpoint, method, country, status, userAgent],
  doubles: [responseTime, success (0/1), rateLimit (0/1)],
  indexes: [requestId]
}
```

### Contact Form Analytics
```javascript
{
  blobs: ['contact_form', project, has_company, email_status, country],
  doubles: [1, messageLength, emailSuccess (0/1)],
  indexes: [emailDomain]
}
```

## Querying Analytics

### Using the Query Script

```bash
# Get summary of last 24 hours
./query-analytics.sh summary

# Get contact form submissions (last 7 days)
./query-analytics.sh contact

# Get geographic distribution
./query-analytics.sh countries

# Get error statistics
./query-analytics.sh errors

# Get performance metrics (last hour)
./query-analytics.sh performance
```

### Setup API Token

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create token with "Account Analytics Read" permission
3. Set environment variables:
   ```bash
   export CLOUDFLARE_ACCOUNT_ID="your_account_id"
   export CLOUDFLARE_API_TOKEN="your_api_token"
   ```

### Manual Queries

You can also query directly using curl:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT blob1 AS endpoint, COUNT(*) AS requests FROM flong_dev_metrics WHERE timestamp > NOW() - INTERVAL '\''24'\'' HOUR GROUP BY endpoint"}'
```

## Example Queries

### Most Popular Endpoints
```sql
SELECT 
  blob1 AS endpoint,
  COUNT(*) AS requests
FROM flong_dev_metrics
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY endpoint
ORDER BY requests DESC
LIMIT 10
```

### Contact Form Conversion by Country
```sql
SELECT 
  blob5 AS country,
  COUNT(*) AS submissions,
  SUM(double3) AS successful_emails,
  ROUND(SUM(double3) * 100.0 / COUNT(*), 2) AS success_rate
FROM flong_dev_metrics
WHERE blob1 = 'contact_form'
  AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY country
ORDER BY submissions DESC
```

### Response Time Percentiles
```sql
SELECT 
  blob1 AS endpoint,
  AVG(double1) AS avg_ms,
  APPROX_QUANTILE(double1, 0.5) AS p50_ms,
  APPROX_QUANTILE(double1, 0.95) AS p95_ms,
  APPROX_QUANTILE(double1, 0.99) AS p99_ms
FROM flong_dev_metrics
WHERE timestamp > NOW() - INTERVAL '24' HOUR
GROUP BY endpoint
```

### Error Rate by Endpoint
```sql
SELECT 
  blob1 AS endpoint,
  COUNT(*) AS total_requests,
  SUM(CASE WHEN double2 = 0 THEN 1 ELSE 0 END) AS errors,
  ROUND(SUM(CASE WHEN double2 = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS error_rate
FROM flong_dev_metrics
WHERE timestamp > NOW() - INTERVAL '24' HOUR
GROUP BY endpoint
ORDER BY error_rate DESC
```

## Viewing in Cloudflare Dashboard

1. Go to **Analytics & Logs** → **Analytics Engine**
2. Select your dataset: `flong_dev_metrics`
3. Run custom SQL queries directly in the UI

## Integration with Grafana

You can integrate Analytics Engine with Grafana for visualization:
- Configure Cloudflare as a data source
- Create dashboards with time-series graphs
- Set up alerts based on thresholds

## Cost and Limits

- **Free Tier**: 10 million writes per month
- **Paid**: $0.25 per additional million writes
- **Retention**: 90 days by default
- **Query Limits**: Consult Cloudflare documentation for current limits

## Additional Metrics Ideas

Future metrics you could add:
- A/B testing variants
- Feature flag usage
- API endpoint version usage
- Client SDK versions
- Search queries and results
- Page load times from browser
- Custom business metrics
