# PrivacyNumber Production Deployment Guide

## Overview
This guide will help you deploy your PrivacyNumber application from localhost:3002 to www.privatenumber.org.

## Prerequisites
- Docker and Docker Compose installed on the production server
- Domain name (privatenumber.org) pointing to your server
- SSL certificate for HTTPS
- Required environment variables

## Step 1: Set Environment Variables

Before deploying, you need to set the following environment variables on your production server:

```bash
# Database Configuration
export DATABASE_URL="postgresql://postgres:your_password@db:5432/privacynumber"

# Authentication
export NEXTAUTH_SECRET="your_nextauth_secret_key_here"
export NEXTAUTH_URL="https://www.privatenumber.org"

# SMS-man API Configuration
export SMS_MAN_API_KEY="your_sms_man_api_key_here"
export SMS_MAN_BASE_URL="https://sms-man.com/stubs/handler_api.php"

# PostgreSQL Database Configuration
export POSTGRES_USER="postgres"
export POSTGRES_PASSWORD="your_postgres_password_here"
export POSTGRES_DB="privacynumber"

# Node Environment
export NODE_ENV="production"
```

## Step 2: Deploy Using Docker Compose

### Option A: Automated Deployment Script
```bash
# Make the script executable
chmod +x deploy-production.sh

# Run the deployment script
./deploy-production.sh
```

### Option B: Manual Deployment
```bash
# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
sleep 10

# Run database migrations
docker-compose -f docker-compose.prod.yml exec -T app npm run db:push
```

## Step 3: Configure SSL Certificate

### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d privatenumber.org -d www.privatenumber.org

# Test automatic renewal
sudo certbot renew --dry-run
```

### Manual SSL Certificate
If you have your own SSL certificate:
1. Copy your certificate files to `/home/privacynumber/ssl/`
2. Rename them to `cert.pem` and `key.pem`
3. Restart the nginx container:
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## Step 4: Verify Deployment

### Check Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Test Application Health
```bash
curl https://www.privatenumber.org/api/health
```

### Check Application Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f db

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## Step 5: Configure DNS

Make sure your DNS records point to your server:
- A record: `privatenumber.org` → Your server IP
- A record: `www.privatenumber.org` → Your server IP

## Step 6: Monitor and Maintain

### Regular Maintenance Tasks
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres privacynumber > backup.sql

# Monitor disk space
df -h
docker system df
```

### Health Monitoring
- Set up monitoring for the `/api/health` endpoint
- Monitor disk space and memory usage
- Set up log rotation for Docker containers

## Troubleshooting

### Common Issues

1. **Build fails with "Link is not defined"**
   - Fixed: Added missing Link import in check-how-it-works.tsx

2. **Database connection fails**
   - Check DATABASE_URL environment variable
   - Ensure PostgreSQL container is running
   - Verify database credentials

3. **SSL certificate issues**
   - Check certificate files in ssl/ directory
   - Verify nginx configuration
   - Test SSL with: `openssl s_client -connect privatenumber.org:443`

4. **Application not responding**
   - Check container logs: `docker-compose logs app`
   - Verify port mapping in docker-compose.prod.yml
   - Test internal connectivity: `docker-compose exec app curl localhost:3000`

### Rollback Procedure
If deployment fails:
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore previous version (if you have backups)
# Copy previous .env files and restart
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

1. **Environment Variables**: Never commit .env files to version control
2. **Database Security**: Use strong passwords and limit database access
3. **SSL/TLS**: Always use HTTPS in production
4. **Firewall**: Configure firewall to only allow necessary ports (80, 443, 22)
5. **Updates**: Keep Docker images and dependencies updated

## Performance Optimization

1. **Enable Gzip Compression**: Already configured in nginx.conf
2. **Static File Caching**: Configure appropriate cache headers
3. **Database Optimization**: Monitor query performance
4. **CDN**: Consider using a CDN for static assets

## Support

For issues or questions:
- Check application logs first
- Review this deployment guide
- Test individual components (database, API, frontend)
- Verify environment variables and configuration
