import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import 'dotenv/config';
import config from './index';

const connectionString = `${config.database.url}`;

const adapter = new PrismaPg({ connectionString });
const database = new PrismaClient({ adapter });

// Connect to Prisma
const connectDB = async (): Promise<void> => {
  try {
    await database.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Close Prisma connection
const closeDB = async (): Promise<void> => {
  await database.$disconnect();
};

export { closeDB, connectDB, database };