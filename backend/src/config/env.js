const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cryo_erp_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'cryo_erp_access_secret_super_secure_key_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'cryo_erp_refresh_secret_super_secure_key_2026_dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  },
  tally: {
    baseUrl: process.env.TALLY_BASE_URL || 'http://localhost:9000',
    apiKey: process.env.TALLY_API_KEY || '',
    companyName: process.env.TALLY_COMPANY_NAME || 'Cryo Scientific Systems Pvt Ltd'
  }
};
