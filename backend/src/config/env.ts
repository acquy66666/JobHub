import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '8080',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:3000').trim(),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-me',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER || '',
  BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
