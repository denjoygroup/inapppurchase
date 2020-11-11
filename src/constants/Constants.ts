import IConstants from './interfaces/IConstants';
import { injectable } from 'inversify';
import path from 'path';
import dotenv from 'dotenv';

let pathToEnv: string | null;

switch (process.env.NODE_ENV) {
  case 'production':
    pathToEnv = path.join(__dirname, '../../.env.prod.env');
    break;
  case 'development':
    pathToEnv = path.join(__dirname, '../../.env.dev.env');
    break;
  case 'test':
    pathToEnv = path.join(__dirname, '../../.env.test.env');
    break;
  default:
    pathToEnv = path.join(__dirname, '../../.env.dev.env');
}

dotenv.config({path: pathToEnv});

@injectable()
export default class Constants implements IConstants {
  port: number = parseInt(process.env.PORT!)
  runListenService = (process.env.RUN_LISTEN_SERVICE && process.env.RUN_LISTEN_SERVICE === 'true') ? true : false;
  postgres: any = {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT!),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,

    ca: (process.env.POSTGRES_CA) ? Buffer.from(process.env.POSTGRES_CA, 'base64').toString() : undefined,
    key: (process.env.POSTGRES_KEY) ? Buffer.from(process.env.POSTGRES_KEY, 'base64').toString() : undefined,
    cert: (process.env.POSTGRES_CERT) ? Buffer.from(process.env.POSTGRES_CERT, 'base64').toString() : undefined
  }
  redis: any = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!)
  }

  apple: any = {
    password: process.env.APPLE_SHARED_SECRET,
    host: 'buy.itunes.apple.com',
    sandbox: 'sandbox.itunes.apple.com',
    path: '/verifyReceipt',
    apiHost: 'api.appstoreconnect.apple.com',
    pathToCheckSales: '/v1/salesReports',
  }
  google: any = {
    host: 'androidpublisher.googleapis.com',
    path: '/androidpublisher/v3/applications',
    email: process.env.GOOGLE_EMAIL,
    key: process.env.GOOGLE_KEY,
    storeName: process.env.GOOGLE_STORE_NAME
  }
}
