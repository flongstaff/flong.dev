🏗️ Infrastructure Overview
Internet → Cloudflare → Cloudflare Tunnel → Proxmox Host → Docker Containers
                                                        ├── Caddy (Reverse Proxy)
                                                        ├── flong.dev (Website)
                                                        ├── mailcow (Email Server)
                                                        └── Other Services
📋 Prerequisites

Proxmox VE server running
Domain name (flong.dev) pointing to Cloudflare
Cloudflare account with API access
Basic knowledge of Docker and Linux

🚀 Step 1: Proxmox VM Setup
Create Ubuntu VM in Proxmox
bash# Download Ubuntu Server 22.04 LTS ISO to Proxmox
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# Create VM with recommended specs:
# - 4GB RAM minimum (8GB recommended)
# - 2 CPU cores minimum
# - 50GB storage minimum
# - Bridge network connection
VM Configuration
bash# After Ubuntu installation, update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply changes
sudo reboot
🌐 Step 2: Cloudflare Tunnel Setup
Install cloudflared
bash# Download and install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate with Cloudflare
cloudflared tunnel login
Create Tunnel
bash# Create tunnel
cloudflared tunnel create flong-tunnel

# Note the tunnel ID - you'll need it later
cloudflared tunnel list

# Create config file
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
Cloudflare Tunnel Config (/etc/cloudflared/config.yml)
yamltunnel: YOUR_TUNNEL_ID
credentials-file: /home/ubuntu/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: flong.dev
    service: http://localhost:80
  - hostname: www.flong.dev
    service: http://localhost:80
  - hostname: mail.flong.dev
    service: http://localhost:8080
  - service: http_status:404
Start Tunnel Service
bash# Install as system service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Add DNS records in Cloudflare dashboard
# flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
# www.flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
# mail.flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
🔧 Step 3: Directory Structure Setup
bash# Create project structure
mkdir -p ~/flong-infrastructure/{website,caddy,mailcow,configs}
cd ~/flong-infrastructure
🌐 Step 4: Caddy Configuration
Create Caddyfile
bashnano caddy/Caddyfile
caddy# Caddyfile
{
    email hello@flong.dev
    auto_https off
}

flong.dev, www.flong.dev {
    reverse_proxy website:80
    
    header {
        # Security headers
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:;"
    }
    
    # Gzip compression
    encode gzip
    
    # Cache static assets
    @static {
        path *.css *.js *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000"
}

mail.flong.dev {
    reverse_proxy mailcow-dockerized-nginx-mailcow-1:80
}

# Admin interface (optional)
admin.flong.dev {
    reverse_proxy website:80
    
    # Basic auth for admin section
    basicauth /admin/* {
        admin $2a$14$Zkx19XLiW6VYouLHR5NbEOv8YEw/9lrq5jvbZ8nPP7I2x7p5F5nKu
    }
}
📧 Step 5: mailcow Setup
bash# Clone mailcow
cd ~/flong-infrastructure
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized

# Generate configuration
./generate_config.sh

# Edit mailcow.conf
nano mailcow.conf
mailcow Configuration Updates
bash# Key settings in mailcow.conf
MAILCOW_HOSTNAME=mail.flong.dev
MAILCOW_PASS_SCHEME=BLF-CRYPT
HTTP_PORT=8080
HTTPS_PORT=8443
HTTP_BIND=0.0.0.0
HTTPS_BIND=0.0.0.0

# Disable built-in ACME (we use Cloudflare)
SKIP_LETS_ENCRYPT=y
🐳 Step 6: Docker Compose Setup
Main Docker Compose File
bashcd ~/flong-infrastructure
nano docker-compose.yml
yamlversion: '3.8'

networks:
  web:
    external: false
  mailcow-network:
    external: false

services:
  # Caddy Reverse Proxy
  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile
      - ./caddy/data:/data
      - ./caddy/config:/config
    networks:
      - web
      - mailcow-network
    environment:
      - CADDY_INGRESS_NETWORKS=web

  # flong.dev Website
  website:
    image: nginx:alpine
    container_name: flong-website
    restart: unless-stopped
    volumes:
      - ./website:/usr/share/nginx/html:ro
      - ./configs/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - web
    depends_on:
      - caddy

  # Portainer for container management (optional)
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - web

volumes:
  portainer_data:
Nginx Configuration for Website
bashnano configs/nginx.conf
nginxevents {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security for admin section
        location /admin {
            # This will be handled by Caddy basic auth
            try_files $uri $uri/ =404;
        }
        
        location / {
            try_files $uri $uri/ =404;
        }
    }
}
🚀 Step 7: Deploy Everything
Copy Website Files
bash# Copy your website files to the website directory
cp /path/to/your/index.html ~/flong-infrastructure/website/
# Add any additional assets (CSS, JS, images)
Start Services
bashcd ~/flong-infrastructure

# Start main services
docker-compose up -d

# Start mailcow (in separate terminal)
cd mailcow-dockerized
docker-compose up -d
Verify Deployment
bash# Check if services are running
docker ps

# Check logs
docker-compose logs -f caddy
docker-compose logs -f website

# Test local connectivity
curl -H "Host: flong.dev" http://localhost
🔒 Step 8: Security Hardening
Firewall Configuration
bash# Install and configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
Fail2ban Setup
bash# Install fail2ban
sudo apt install fail2ban -y

# Create jail configuration
sudo nano /etc/fail2ban/jail.local
ini[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[caddy-auth]
enabled = true
port = http,https
filter = caddy-auth
logpath = /var/log/caddy/*.log
maxretry = 3
bantime = 3600
📊 Step 9: Monitoring & Maintenance
Health Check Script
bashnano ~/health-check.sh
bash#!/bin/bash
# Health check script

echo "=== System Health Check ==="
echo "Date: $(date)"
echo ""

# Check Docker services
echo "Docker Services:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

# Check disk space
echo "Disk Usage:"
df -h
echo ""

# Check memory
echo "Memory Usage:"
free -h
echo ""

# Check website response
echo "Website Status:"
curl -s -o /dev/null -w "flong.dev: %{http_code} - %{time_total}s\n" -H "Host: flong.dev" http://localhost
echo ""

# Check Cloudflare tunnel
echo "Cloudflare Tunnel:"
sudo systemctl status cloudflared --no-pager -l
bashchmod +x ~/health-check.sh
Backup Script
bashnano ~/backup.sh
bash#!/bin/bash
# Backup script

BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup website
cp -r ~/flong-infrastructure/website $BACKUP_DIR/

# Backup configurations
cp -r ~/flong-infrastructure/caddy $BACKUP_DIR/
cp -r ~/flong-infrastructure/configs $BACKUP_DIR/

# Backup mailcow data
docker-compose -f ~/flong-infrastructure/mailcow-dockerized/docker-compose.yml exec mysql-mailcow mysqldump --default-character-set=utf8mb4 -u root -p${DBROOT} --all-databases > $BACKUP_DIR/mailcow-backup.sql

echo "Backup completed: $BACKUP_DIR"
🔄 Step 10: Automation & Updates
Crontab for Automated Tasks
bashcrontab -e
bash# Daily health check
0 8 * * * /home/ubuntu/health-check.sh >> /var/log/health-check.log 2>&1

# Weekly backup
0 2 * * 0 /home/ubuntu/backup.sh >> /var/log/backup.log 2>&1

# Monthly system update
0 3 1 * * apt update && apt upgrade -y && docker system prune -f
🎯 Step 11: Domain & DNS Configuration
Cloudflare DNS Settings

Go to Cloudflare Dashboard
Select your domain (flong.dev)
Add these DNS records:

flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
www.flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
mail.flong.dev → CNAME → YOUR_TUNNEL_ID.cfargotunnel.com
MX record for email: mail.flong.dev (priority 10)



SSL/TLS Settings

Set SSL/TLS encryption mode to "Full (strict)"
Enable "Always Use HTTPS"
Enable HSTS

📱 For iPad Download
The website files will be prepared in a downloadable format. You can:

Download via browser: Access the files through the web interface
Use Git: Clone the repository to your iPad using Working Copy app
File transfer: Use apps like Documents by Readdle to manage files

🚨 Troubleshooting
Common Issues & Solutions

Services not accessible:
bash# Check Cloudflare tunnel status
sudo systemctl status cloudflared

# Restart tunnel
sudo systemctl restart cloudflared

Docker containers not starting:
bash# Check logs
docker-compose logs servicename

# Restart services
docker-compose restart

Email not working:
bash# Check mailcow logs
cd ~/flong-infrastructure/mailcow-dockerized
docker-compose logs

Website not loading:
bash# Check Caddy configuration
docker exec caddy caddy validate --config /etc/caddy/Caddyfile


📋 Maintenance Checklist
Weekly Tasks

 Run health check script
 Check system resources
 Review error logs
 Test website functionality

Monthly Tasks

 Update system packages
 Update Docker images
 Review security logs
 Backup verification

Quarterly Tasks

 Security audit
 Performance optimization
 Documentation updates
 Disaster recovery testing

This guide provides a complete production-ready deployment of your flong.dev website with enterprise-grade infrastructure including reverse proxy, email services, security hardening, and monitoring.