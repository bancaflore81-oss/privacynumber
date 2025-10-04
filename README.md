# SMS-Man Clone

A complete replica of SMS-Man.com with all features, design, APIs, and authentication systems.

## 🚀 Features

### Core Functionality
- **SMS Verification Service** - Receive SMS online from 200+ countries
- **Phone Number Rental** - Temporary numbers for verification
- **API Integration** - Complete REST API for developers
- **Multi-language Support** - English, Russian, Chinese
- **Real-time SMS Delivery** - Instant SMS reception

### Authentication & Security
- **JWT Authentication** - Secure token-based auth
- **Social Login** - GitHub, Google, Facebook, Twitter, Telegram
- **Email Verification** - Secure account activation
- **Password Reset** - Secure password recovery
- **Rate Limiting** - API protection
- **Input Validation** - XSS and injection protection

### Payment System
- **Multiple Payment Methods** - Credit cards, PayPal, Cryptocurrency
- **Stripe Integration** - Secure card processing
- **PayPal Support** - Alternative payment option
- **Crypto Payments** - Bitcoin, Ethereum, Litecoin, USDT
- **Balance Management** - Real-time balance tracking

### Admin Panel
- **User Management** - Complete user administration
- **Service Management** - Country and application management
- **Analytics Dashboard** - Usage statistics and reports
- **Price Management** - Dynamic pricing control
- **System Monitoring** - Health checks and logs

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Swagger** - API documentation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **MongoDB** - Database
- **Redis** - Caching and sessions

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sms-man-clone
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   nano backend/.env
   ```

4. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Or start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api-docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sms-man-clone
DB_NAME=sms-man-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Server
PORT=5000
NODE_ENV=development

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@sms-man-clone.com
FROM_NAME=SMS-Man Clone

# Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Control API (SMS-Man Compatible)
- `GET /api/control/get-balance` - Get user balance
- `GET /api/control/limits` - Get available numbers
- `GET /api/control/get-number` - Request phone number
- `GET /api/control/get-sms` - Get SMS code
- `POST /api/control/set-status` - Change request status
- `GET /api/control/get-prices` - Get pricing
- `GET /api/control/countries` - Get countries
- `GET /api/control/applications` - Get applications

### User Management
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `GET /api/user/balance` - Get balance
- `GET /api/user/transactions` - Get transactions
- `GET /api/user/numbers` - Get number requests
- `GET /api/user/api-key` - Get API key
- `POST /api/user/api-key` - Regenerate API key

### Payment System
- `GET /api/payment/methods` - Get payment methods
- `POST /api/payment/stripe/create-payment-intent` - Create Stripe payment
- `POST /api/payment/stripe/confirm-payment` - Confirm Stripe payment
- `POST /api/payment/paypal/create-payment` - Create PayPal payment
- `POST /api/payment/paypal/execute-payment` - Execute PayPal payment
- `POST /api/payment/crypto/generate-address` - Generate crypto address
- `POST /api/payment/crypto/check-payment` - Check crypto payment

## 🎨 Design Features

### Homepage Sections
1. **Hero Section** - Main value proposition
2. **Country & Service Selection** - Interactive selection
3. **Popular Services** - Service showcase
4. **Value Proposition** - Privacy benefits
5. **How It Works** - 3-step process
6. **Comparison Table** - Pricing plans
7. **Features** - Key benefits
8. **Professional Solutions** - API information
9. **FAQ** - Common questions

### UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference
- **Multi-language** - EN/RU/中文 support
- **Modern UI** - Clean, professional design
- **Accessibility** - WCAG compliant
- **Performance** - Optimized loading

## 🔒 Security Features

- **JWT Authentication** - Secure token system
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - API protection
- **Input Validation** - XSS and injection prevention
- **CORS Configuration** - Cross-origin protection
- **Helmet.js** - Security headers
- **API Key Encryption** - Secure API access
- **Request Logging** - Audit trail

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
1. **Configure environment variables**
2. **Set up SSL certificates**
3. **Configure domain names**
4. **Set up monitoring**
5. **Configure backups**

## 📊 Monitoring

### Health Checks
- **API Health** - `/api/health`
- **Database Status** - MongoDB connection
- **Service Status** - All services monitoring

### Logging
- **Request Logs** - API request tracking
- **Error Logs** - Error monitoring
- **Security Logs** - Security event tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@sms-man-clone.com
- **Documentation**: [API Docs](http://localhost:5000/api-docs)
- **Issues**: GitHub Issues

## 🔄 Updates

### Version 1.0.0
- Initial release
- Complete SMS-Man replica
- All core features implemented
- Docker deployment ready
- API documentation complete

---

**Note**: This is a complete replica of SMS-Man.com for educational and development purposes. All features are implemented to match the original service functionality.
