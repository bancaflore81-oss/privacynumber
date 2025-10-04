// Initialize database with sample data
db = db.getSiblingDB('sms-man-clone');

// Create collections
db.createCollection('users');
db.createCollection('numberrequests');
db.createCollection('countries');
db.createCollection('applications');
db.createCollection('prices');

// Insert sample countries
db.countries.insertMany([
  { id: 0, title: 'Russia', code: 'RU', phoneCode: '7', isActive: true, priority: 1, currency: 'USD', timezone: 'Europe/Moscow', language: 'ru' },
  { id: 1, title: 'United States', code: 'US', phoneCode: '1', isActive: true, priority: 2, currency: 'USD', timezone: 'America/New_York', language: 'en' },
  { id: 2, title: 'China', code: 'CN', phoneCode: '86', isActive: true, priority: 3, currency: 'USD', timezone: 'Asia/Shanghai', language: 'zh' },
  { id: 3, title: 'Germany', code: 'DE', phoneCode: '49', isActive: true, priority: 4, currency: 'USD', timezone: 'Europe/Berlin', language: 'en' },
  { id: 4, title: 'United Kingdom', code: 'GB', phoneCode: '44', isActive: true, priority: 5, currency: 'USD', timezone: 'Europe/London', language: 'en' },
  { id: 5, title: 'France', code: 'FR', phoneCode: '33', isActive: true, priority: 6, currency: 'USD', timezone: 'Europe/Paris', language: 'en' },
  { id: 6, title: 'Japan', code: 'JP', phoneCode: '81', isActive: true, priority: 7, currency: 'USD', timezone: 'Asia/Tokyo', language: 'en' },
  { id: 7, title: 'Canada', code: 'CA', phoneCode: '1', isActive: true, priority: 8, currency: 'USD', timezone: 'America/Toronto', language: 'en' }
]);

// Insert sample applications
db.applications.insertMany([
  { id: 1, name: 'Vkontakte', code: 'vk', category: 'social', isActive: true, priority: 1, color: '#4C75A3' },
  { id: 2, name: 'Telegram', code: 'telegram', category: 'messaging', isActive: true, priority: 2, color: '#0088CC' },
  { id: 3, name: 'WhatsApp', code: 'whatsapp', category: 'messaging', isActive: true, priority: 3, color: '#25D366' },
  { id: 4, name: 'Instagram', code: 'instagram', category: 'social', isActive: true, priority: 4, color: '#E4405F' },
  { id: 5, name: 'Facebook', code: 'facebook', category: 'social', isActive: true, priority: 5, color: '#1877F2' },
  { id: 6, name: 'Twitter', code: 'twitter', category: 'social', isActive: true, priority: 6, color: '#1DA1F2' },
  { id: 7, name: 'TikTok', code: 'tiktok', category: 'social', isActive: true, priority: 7, color: '#000000' },
  { id: 8, name: 'Discord', code: 'discord', category: 'messaging', isActive: true, priority: 8, color: '#5865F2' },
  { id: 9, name: 'Snapchat', code: 'snapchat', category: 'social', isActive: true, priority: 9, color: '#FFFC00' },
  { id: 10, name: 'LinkedIn', code: 'linkedin', category: 'social', isActive: true, priority: 10, color: '#0077B5' }
]);

// Insert sample prices
db.prices.insertMany([
  // Russia prices
  { countryId: 0, applicationId: 1, cost: 0.15, currency: 'USD', count: 1000, isActive: true },
  { countryId: 0, applicationId: 2, cost: 0.20, currency: 'USD', count: 800, isActive: true },
  { countryId: 0, applicationId: 3, cost: 0.25, currency: 'USD', count: 600, isActive: true },
  { countryId: 0, applicationId: 4, cost: 0.30, currency: 'USD', count: 500, isActive: true },
  { countryId: 0, applicationId: 5, cost: 0.35, currency: 'USD', count: 400, isActive: true },
  
  // USA prices
  { countryId: 1, applicationId: 1, cost: 0.20, currency: 'USD', count: 2000, isActive: true },
  { countryId: 1, applicationId: 2, cost: 0.25, currency: 'USD', count: 1500, isActive: true },
  { countryId: 1, applicationId: 3, cost: 0.30, currency: 'USD', count: 1200, isActive: true },
  { countryId: 1, applicationId: 4, cost: 0.35, currency: 'USD', count: 1000, isActive: true },
  { countryId: 1, applicationId: 5, cost: 0.40, currency: 'USD', count: 800, isActive: true },
  
  // China prices
  { countryId: 2, applicationId: 1, cost: 0.10, currency: 'USD', count: 3000, isActive: true },
  { countryId: 2, applicationId: 2, cost: 0.15, currency: 'USD', count: 2500, isActive: true },
  { countryId: 2, applicationId: 3, cost: 0.20, currency: 'USD', count: 2000, isActive: true },
  { countryId: 2, applicationId: 4, cost: 0.25, currency: 'USD', count: 1500, isActive: true },
  { countryId: 2, applicationId: 5, cost: 0.30, currency: 'USD', count: 1000, isActive: true }
]);

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ apiKey: 1 }, { unique: true, sparse: true });
db.users.createIndex({ createdAt: -1 });

db.numberrequests.createIndex({ requestId: 1 }, { unique: true });
db.numberrequests.createIndex({ userId: 1, createdAt: -1 });
db.numberrequests.createIndex({ countryId: 1, applicationId: 1 });
db.numberrequests.createIndex({ status: 1, createdAt: -1 });
db.numberrequests.createIndex({ phoneNumber: 1, status: 1 });
db.numberrequests.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

db.countries.createIndex({ id: 1 }, { unique: true });
db.countries.createIndex({ code: 1 }, { unique: true });
db.countries.createIndex({ isActive: 1, priority: -1 });

db.applications.createIndex({ id: 1 }, { unique: true });
db.applications.createIndex({ code: 1 }, { unique: true });
db.applications.createIndex({ isActive: 1, priority: -1 });
db.applications.createIndex({ category: 1, isActive: 1 });

db.prices.createIndex({ countryId: 1, applicationId: 1 }, { unique: true });
db.prices.createIndex({ countryId: 1, isActive: 1 });
db.prices.createIndex({ applicationId: 1, isActive: 1 });
db.prices.createIndex({ cost: 1 });
db.prices.createIndex({ currency: 1, isActive: 1 });

print('Database initialized successfully!');
