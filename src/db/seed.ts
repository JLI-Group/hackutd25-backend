import mongoose from 'mongoose';
import Car from '../models/car.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackutd25';
console.log('Using MongoDB URI:', MONGODB_URI);

const carData = [
  {
    name: "Corolla",
    bodyStyle: "Sedan",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Gasoline", "Hybrid"],
    seats: 5,
    driveType: ["FWD"],
    trimLevels: ["Base", "Sport", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Corolla Hybrid",
    bodyStyle: "Sedan",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["FWD", "AWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Corolla Hatchback",
    bodyStyle: "Sedan",
    usage: ["Leisure", "Daily commuting"],
    drivingExperience: ["Sporty & responsive"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["FWD"],
    trimLevels: ["Base", "Sport", "EX"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Prius",
    bodyStyle: "Sedan",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD", "FWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Prius Plug-in Hybrid",
    bodyStyle: "Sedan",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid", "Electric"],
    seats: 5,
    driveType: ["FWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Camry",
    bodyStyle: "Sedan",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable", "Sporty & responsive"],
    engineType: ["Gasoline", "Hybrid"],
    seats: 5,
    driveType: ["FWD", "AWD"],
    trimLevels: ["Base", "Sport", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "GR86",
    bodyStyle: "Sedan",
    usage: ["Leisure"],
    drivingExperience: ["Sporty & responsive"],
    engineType: ["Gasoline"],
    seats: 2,
    driveType: ["RWD"],
    trimLevels: ["Sport", "EX"],
    priority: ["Power"],
  },
  {
    name: "GR Corolla",
    bodyStyle: "Sedan",
    usage: ["Leisure"],
    drivingExperience: ["Sporty & responsive"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["Sport", "EX"],
    priority: ["Power"],
  },
  {
    name: "GR Supra",
    bodyStyle: "Sedan",
    usage: ["Leisure"],
    drivingExperience: ["Sporty & responsive"],
    engineType: ["Gasoline"],
    seats: 2,
    driveType: ["RWD"],
    trimLevels: ["Sport", "EX", "Luxury"],
    priority: ["Power"],
  },
  {
    name: "Sienna",
    bodyStyle: "Mini-van",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 7,
    driveType: ["AWD", "FWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Toyota Crown",
    bodyStyle: "Sedan",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Corolla Cross",
    bodyStyle: "SUV",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["FWD", "AWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Corolla Cross Hybrid",
    bodyStyle: "SUV",
    usage: ["Daily commuting"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "RAV4",
    bodyStyle: "SUV",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["AWD", "FWD"],
    trimLevels: ["Base", "Sport", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "RAV4 Hybrid",
    bodyStyle: "SUV",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "RAV4 Plug-in Hybrid",
    bodyStyle: "SUV",
    usage: ["Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid", "Electric"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "bZ",
    bodyStyle: "SUV",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Electric"],
    seats: 5,
    driveType: ["AWD", "FWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Highlander",
    bodyStyle: "SUV",
    usage: ["Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Gasoline"],
    seats: 7,
    driveType: ["AWD", "FWD"],
    trimLevels: ["Base", "EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Highlander Hybrid",
    bodyStyle: "SUV",
    usage: ["Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Hybrid"],
    seats: 7,
    driveType: ["AWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
  {
    name: "Land Cruiser",
    bodyStyle: "SUV",
    usage: ["Off-road", "Work"],
    drivingExperience: ["Off-road capable"],
    engineType: ["Gasoline", "Hybrid"],
    seats: 7,
    driveType: ["AWD"],
    trimLevels: ["Sport", "EX", "Luxury"],
    priority: ["Power"],
  },
  {
    name: "Tacoma",
    bodyStyle: "Truck",
    usage: ["Work", "Off-road"],
    drivingExperience: ["Off-road capable"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["RWD", "AWD"],
    trimLevels: ["Base", "Sport", "EX"],
    priority: ["Power"],
  },
  {
    name: "Tacoma i-FORCE MAX",
    bodyStyle: "Truck",
    usage: ["Work", "Off-road"],
    drivingExperience: ["Off-road capable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["Sport", "EX", "Luxury"],
    priority: ["Power"],
  },
  {
    name: "Tundra",
    bodyStyle: "Truck",
    usage: ["Work", "Off-road"],
    drivingExperience: ["Off-road capable"],
    engineType: ["Gasoline"],
    seats: 5,
    driveType: ["RWD", "AWD"],
    trimLevels: ["Base", "Sport", "EX", "Luxury"],
    priority: ["Power"],
  },
  {
    name: "Tundra i-FORCE MAX",
    bodyStyle: "Truck",
    usage: ["Work", "Off-road"],
    drivingExperience: ["Off-road capable"],
    engineType: ["Hybrid"],
    seats: 5,
    driveType: ["AWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Power"],
  },
  {
    name: "Mirai",
    bodyStyle: "Sedan",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Electric"],
    seats: 5,
    driveType: ["RWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI + '/Hack2025/');
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await Car.deleteMany({});
    console.log('Cleared existing cars from database');

    // Insert new data
    await Car.insertMany(carData);
    console.log('✅ Toyota data seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding function
seedDatabase();