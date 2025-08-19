# KV Namespace Setup Instructions

## Required Commands:
```bash
# 1. Rate limiting and security
npx wrangler kv namespace create RATE_LIMIT
npx wrangler kv namespace create RATE_LIMIT --preview

# 2. Analytics and metrics  
npx wrangler kv namespace create ANALYTICS
npx wrangler kv namespace create ANALYTICS --preview

# 3. Contact form and leads
npx wrangler kv namespace create CONTACTS
npx wrangler kv namespace create CONTACTS --preview
```

## Update wrangler.toml with returned IDs:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your_production_id"
preview_id = "your_preview_id"

[[kv_namespaces]]
binding = "ANALYTICS"
id = "your_production_id"
preview_id = "your_preview_id"

[[kv_namespaces]]
binding = "CONTACTS"
id = "your_production_id"  
preview_id = "your_preview_id"
```

## Benefits:
- **Rate Limiting**: Prevent spam/abuse across requests
- **Analytics**: Track visitor behavior, popular content
- **Contact Management**: Store and retrieve form submissions
- **Performance**: Fast edge storage (global replication)
- **Persistence**: Data survives Worker restarts