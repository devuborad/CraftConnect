import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  get PORT(): string {
    return process.env.PORT || '5000';
  },
  get DB_HOST(): string {
    return process.env.DB_HOST || 'localhost';
  },
  get DB_PORT(): number {
    return parseInt(process.env.DB_PORT || '3306', 10);
  },
  get DB_USER(): string {
    return process.env.DB_USER || 'root';
  },
  get DB_PASSWORD(): string {
    return process.env.DB_PASSWORD || 'root';
  },
  get DB_NAME(): string {
    return process.env.DB_NAME || 'craftconnect';
  },
  get JWT_SECRET(): string {
    return process.env.JWT_SECRET || 'craftconnect_super_secret_jwt_key_2026';
  },
  get FRONTEND_URL(): string {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  },
  get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY || '';
  },
  get GEMINI_MODEL(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  },
  get GEMINI_IMAGE_MODEL(): string {
    return process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  },
};
