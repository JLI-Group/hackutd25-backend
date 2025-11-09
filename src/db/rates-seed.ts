import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apr from '../models/apr';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/hackutd25';
console.log('Using MongoDB URI:', MONGODB_URI);

const aprData = [
  { tier: 'SuperPrime', rate: 0.0384 },
  { tier: 'Prime', rate: 0.049 },
  { tier: 'Non-Prime', rate: 0.0725 },
  { tier: 'SubPrime', rate: 0.1011 },
  { tier: 'Deep-SubPrime', rate: 0.1293 },
]

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed APR data
        await apr.deleteMany({});
        await apr.insertMany(aprData);
        console.log('APR data seeded');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();