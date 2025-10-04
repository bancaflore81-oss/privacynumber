# Production Configuration for privacynumber.org

## Environment Variables Required

### Database
- `DATABASE_URL`: PostgreSQL connection string for production database
- Example: `postgresql://username:password@your-db-host:5432/privacynumber`

### Authentication
- `NEXTAUTH_SECRET`: Strong secret key for JWT tokens (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Production URL (https://privacynumber.org)

### SMS-man API
- `SMS_MAN_API_KEY`: Your production SMS-man API key
- `SMS_MAN_BASE_URL`: https://sms-man.com/stubs/handler_api.php

## Deployment Steps

1. **Set up production database**
   ```bash
   # Create PostgreSQL database
   createdb privacynumber
   ```

2. **Configure environment variables**
   ```bash
   # Copy production environment file
   cp .env.production.example .env.production
   # Edit with your actual values
   ```

3. **Deploy using Docker**
   ```bash
   # Build and deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Run database migrations**
   ```bash
   # Apply database schema
   docker-compose exec app npm run db:push
   ```

5. **Verify deployment**
   ```bash
   # Check application health
   curl https://privacynumber.org/api/health
   ```

## Monitoring

- Application logs: `docker-compose logs -f app`
- Database logs: `docker-compose logs -f db`
- Health check: `curl https://privacynumber.org/api/health`

## SSL Certificate

For production deployment, ensure SSL certificate is configured:
- Use Let's Encrypt with Certbot
- Or configure with your hosting provider
- Update NEXTAUTH_URL to use HTTPS
