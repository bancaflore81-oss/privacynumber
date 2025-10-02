# PrivacyNumber - SMS Verification Service

A secure SMS verification service that provides disposable phone numbers for online verification. Built with Next.js, TypeScript, and integrated with SMS-man API.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication system
- 📱 **Disposable Numbers** - Get phone numbers from 200+ countries
- ⚡ **Instant Delivery** - Receive numbers in seconds
- 💰 **Pay Per Use** - No monthly subscriptions, pay only for what you use
- 🌍 **Global Coverage** - Support for major services worldwide
- 📊 **Real-time Monitoring** - Track SMS status and codes in real-time
- 🎨 **Modern UI** - Beautiful SaaS Boilerplate design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **SMS Service**: SMS-man API integration
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMS-man API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/privacynumber.git
cd privacynumber
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/privacynumber"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
SMS_MAN_API_KEY="your-sms-man-api-key"
SMS_MAN_BASE_URL="https://sms-man.com/stubs/handler_api.php"
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## API Endpoints

### Authentication
- `POST /api/auth` - Register or login
- `GET /api/auth/profile` - Get user profile

### SMS Management
- `GET /api/sms` - Get user's SMS requests
- `POST /api/sms` - Refresh SMS status
- `POST /api/purchase` - Purchase new number

### Data
- `GET /api/countries` - Get available countries
- `GET /api/services` - Get available services
- `GET /api/prices` - Get pricing information
- `GET /api/balance` - Get account balance

## Database Schema

### Users
- `id` - Unique identifier
- `email` - User email
- `password` - Hashed password
- `name` - User's full name
- `smsManToken` - SMS-man API token
- `balance` - Account balance

### SMS Requests
- `id` - Unique identifier
- `userId` - User reference
- `requestId` - SMS-man request ID
- `countryId` - Selected country
- `serviceId` - Selected service
- `phoneNumber` - Assigned phone number
- `status` - Request status (PENDING, READY, CLOSE, etc.)
- `smsCode` - Received SMS code
- `maxPrice` - Maximum price limit
- `currency` - Currency type

## Deployment

### Using Docker

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Set up the database:
```bash
docker-compose exec app npm run db:push
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | JWT secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `SMS_MAN_API_KEY` | SMS-man API key | Yes |
| `SMS_MAN_BASE_URL` | SMS-man API base URL | Yes |

## SMS-man Integration

This application integrates with SMS-man API for:
- Getting available countries and services
- Purchasing phone numbers
- Receiving SMS codes
- Managing request status
- Checking account balance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@privacynumber.org or create an issue on GitHub.