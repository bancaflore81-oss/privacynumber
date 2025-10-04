# 🔐 **SMS-Man Clone with Social Login System**

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/bancaflore81-oss/sms-man-clone)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.0-green.svg)](https://mongodb.com/)

> **Complete SMS management platform with OAuth social authentication**

## 🚀 **Features**

### 🔐 **Social Authentication**
- **Google OAuth 2.0** - One-click Google sign-in
- **Facebook Login** - Social authentication
- **Twitter OAuth** - Twitter integration
- **Telegram Web App** - Telegram bot authentication
- **JWT Tokens** - Secure session management
- **Refresh Tokens** - Persistent authentication

### 🛠️ **Technical Stack**
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: Passport.js + JWT
- **Database**: MongoDB with Docker
- **API**: RESTful API with comprehensive endpoints

### 📱 **SMS Management**
- **Temporary Numbers** - Receive SMS online
- **Multi-Country Support** - Global coverage
- **API Integration** - Developer-friendly
- **Real-time Updates** - Live SMS notifications
- **User Dashboard** - Complete management interface

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │   MongoDB DB    │
│                 │    │                 │    │                 │
│  • Social Login │◄──►│  • Passport.js  │◄──►│  • User Data    │
│  • Dashboard    │    │  • JWT Auth     │    │  • SMS History  │
│  • API Client   │    │  • OAuth Routes │    │  • Sessions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20.x+
- MongoDB 6.0+
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/bancaflore81-oss/sms-man-clone.git
cd sms-man-clone
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp env.example .env
# Configure your environment variables
npm start
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **4. Database Setup**
```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# Or install MongoDB locally
```

## ⚙️ **Configuration**

### **Environment Variables**

#### **Backend (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sms-man-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TWITTER_CONSUMER_KEY=your-twitter-consumer-key
TWITTER_CONSUMER_SECRET=your-twitter-consumer-secret

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### **Frontend (.env.local)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔧 **OAuth Setup**

### **Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:5000/api/auth/google/callback`

### **Facebook Login**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:5000/api/auth/facebook/callback`

### **Twitter OAuth**
1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a new app
3. Enable OAuth 2.0
4. Set callback URL: `http://localhost:5000/api/auth/twitter/callback`

### **Telegram Web App**
1. Create bot with [@BotFather](https://t.me/botfather)
2. Configure Web App URL
3. Bot will be available for authentication

## 📚 **API Documentation**

### **Authentication Endpoints**
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh token
GET  /api/auth/google       # Google OAuth
GET  /api/auth/facebook     # Facebook OAuth
GET  /api/auth/twitter      # Twitter OAuth
POST /api/auth/telegram     # Telegram auth
```

### **SMS Endpoints**
```http
GET  /api/sms/numbers       # Get available numbers
POST /api/sms/rent          # Rent a number
GET  /api/sms/messages      # Get messages
POST /api/sms/send          # Send SMS
```

## 🎨 **Frontend Components**

### **Pages**
- **HomePage** - Landing page with features
- **LoginPage** - Social login interface
- **SignupPage** - Registration with OAuth
- **DashboardPage** - User management panel
- **ProfilePage** - User profile settings

### **Components**
- **Header** - Navigation with logo
- **Layout** - Main layout wrapper
- **ProtectedRoute** - Authentication guard
- **AuthCallbackPage** - OAuth callback handler

## 🚀 **Deployment**

### **Production Build**
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### **Environment Setup**
- Configure production environment variables
- Set up SSL certificates
- Configure domain names
- Set up monitoring

## 📊 **Monitoring & Logs**

### **Backend Logs**
```bash
# View application logs
journalctl -u privacynumber-app -f

# View error logs
journalctl -u privacynumber-app --priority=err
```

### **Database Monitoring**
```bash
# MongoDB logs
docker logs mongodb

# Database stats
mongo --eval "db.stats()"
```

## 🔒 **Security Features**

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Rate Limiting** - API protection
- **CORS Configuration** - Cross-origin security
- **Input Validation** - Data sanitization
- **SQL Injection Protection** - MongoDB security

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/bancaflore81-oss/sms-man-clone/issues)
- **Documentation**: [Wiki](https://github.com/bancaflore81-oss/sms-man-clone/wiki)
- **Email**: support@sms-man-clone.com

## 🎯 **Roadmap**

### **v1.2.0** - Enhanced Features
- [ ] WhatsApp integration
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Webhook support

### **v1.3.0** - Enterprise
- [ ] Multi-tenancy
- [ ] SSO integration
- [ ] Advanced security
- [ ] Compliance features

---

**Made with ❤️ by the SMS-Man Clone Team**

[![GitHub stars](https://img.shields.io/github/stars/bancaflore81-oss/sms-man-clone?style=social)](https://github.com/bancaflore81-oss/sms-man-clone)
[![GitHub forks](https://img.shields.io/github/forks/bancaflore81-oss/sms-man-clone?style=social)](https://github.com/bancaflore81-oss/sms-man-clone)