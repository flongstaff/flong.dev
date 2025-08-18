# DNS Records for flong.dev

## Required DNS Records for MailChannels (Contact Form)

Add these DNS records in your Cloudflare Dashboard > DNS > Records:

### 1. SPF Record
**Type**: TXT  
**Name**: `@` (or `flong.dev`)  
**Value**: `v=spf1 a mx include:relay.mailchannels.net ~all`

### 2. DKIM Record  
**Type**: TXT  
**Name**: `mailchannels._domainkey`  
**Value**: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukTwVpmT6GZ3vNaW7y0nASVF6BLYFLs8e8EGAqhL0z/N1k1MjHp26S7kKrV7O9x5KMKzH2NqWvKP6sxLpMkgJgF2fqGJmK8Jz4W5vUy9rWQ6yQkZ4S6A2lF8xLj9N4F0E3zZv8x9v1sG1rUv4KjD9nK4p0sY8hLN2S4JzT6p7Y2WQ2k0S8z6u9w8sKJ3JKx2o1gX5ZTxJpLNkQq7I3X4cQ7pYvUy2gZNk1N3U4Z9oJ7wPcJp3XrZ0YvY0Tl9Xd2S9F0jZ3oY0`

### 3. DMARC Record (Optional but recommended)
**Type**: TXT  
**Name**: `_dmarc`  
**Value**: `v=DMARC1; p=quarantine; rua=mailto:hello@flong.dev; ruf=mailto:hello@flong.dev; fo=1`

## How to Add DNS Records:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain `flong.dev`
3. Go to **DNS** > **Records**
4. Click **Add record**
5. Enter the details for each record above
6. Click **Save**

## Verification:

After adding the records, you can verify them:

```bash
# Check SPF record
dig TXT flong.dev

# Check DKIM record
dig TXT mailchannels._domainkey.flong.dev

# Check DMARC record
dig TXT _dmarc.flong.dev
```

## Note:
DNS propagation can take up to 24 hours, but usually takes 5-30 minutes. Once these records are active, your contact form will be able to send emails through MailChannels.