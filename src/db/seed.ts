import mongoose from 'mongoose';
import Car from '../models/car.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/hackutd25';
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
    price: 23000,
    description: "The 2025 Corolla is the perfect car for you! It combines Toyota’s legendary reliability with refined comfort and fuel-efficient performance. With both gas and hybrid options, it’s built for smooth daily commutes, offering modern safety tech, a quiet cabin, and a sleek, practical design that fits every lifestyle."
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
    price: 25000,
    description: "The 2025 Corolla Hybrid is the perfect car for you! It offers exceptional fuel efficiency, available all-wheel drive, and advanced safety features that make every drive confident and enjoyable. Quiet, comfortable, and eco-conscious, it’s designed for modern drivers who value sustainability without sacrificing style."
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
    price: 23500,
    description: "The 2025 Corolla Hatchback is the perfect car for you! It brings a youthful edge to everyday driving with dynamic styling, crisp handling, and a versatile cargo space. Designed for fun and functionality, it’s ideal for urban explorers and anyone who loves a spirited ride with everyday practicality."
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
    price: 28000,
    description: "The 2025 Prius is the perfect car for you! With futuristic styling, exceptional fuel efficiency, and available all-wheel drive, it’s engineered for those who want innovation and performance in harmony. The spacious interior, intuitive tech, and whisper-quiet drive make every trip feel effortless and efficient."
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
    price: 32500,
    description: "The 2025 Prius Plug-in Hybrid is the perfect car for you! It blends electric efficiency with hybrid range, letting you enjoy gas-free commutes and long-distance freedom. With sleek styling, cutting-edge connectivity, and smooth power delivery, it’s built for the eco-minded driver who values flexibility and comfort."
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
    price: 28000,
    description: "The 2025 Camry is the perfect car for you! Sleek, stylish, and efficient, it offers a refined blend of performance and comfort. Whether you choose the hybrid or gas version, you’ll enjoy responsive handling, luxurious interiors, and advanced driver assistance features that make every drive rewarding."
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
    price: 29500,
    description: "The 2025 GR86 is the perfect car for you! Lightweight, rear-wheel-drive, and track-ready, it’s built to thrill every corner and straightaway. With precise steering, a rev-happy engine, and a low-slung design, this coupe delivers pure driving excitement for those who love the road as much as the ride."
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
    price: 36000,
    description: "The 2025 GR Corolla is the perfect car for you! Inspired by rally racing, it delivers exhilarating AWD performance and turbocharged power in a hot hatch design. Built for enthusiasts, it combines everyday practicality with heart-racing performance and precision handling that commands every curve."
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
    price: 46000,
    description: "The 2025 GR Supra is the perfect car for you! A modern legend reborn, it delivers breathtaking turbocharged power and precise rear-wheel-drive handling. From its sculpted exterior to its driver-focused cockpit, every inch is crafted for performance and passion. This is driving in its purest form."
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
    price: 37000,
    description: "The 2025 Sienna is the perfect car for you! Designed for families who want efficiency and space, this hybrid minivan delivers impressive mileage, all-wheel-drive confidence, and advanced safety. With flexible seating, upscale comfort, and entertainment tech, it’s the ultimate companion for everyday adventures."
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
    price: 41000,
    description: "The 2025 Toyota Crown is the perfect car for you! It’s a sophisticated hybrid sedan that blends luxury, innovation, and performance. With standard AWD, premium interiors, and bold design, it redefines what a modern executive car can be — powerful, efficient, and strikingly elegant."
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
    price: 26000,
    description: "The 2025 Corolla Cross is the perfect car for you! Compact yet capable, it offers the versatility of an SUV with the comfort and reliability of a Corolla. Ideal for city life or weekend escapes, it provides a smooth, confident ride and efficient performance that fits your lifestyle perfectly."
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
    price: 28500,
    description: "The 2025 Corolla Cross Hybrid is the perfect car for you! It brings hybrid efficiency to a compact SUV, offering AWD traction and smooth power delivery. With smart tech, ample space, and Toyota’s dependability, it’s designed for modern drivers who want both performance and practicality."
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
    price: 30000,
    description: "The 2025 RAV4 is the perfect car for you! As Toyota’s most popular SUV, it delivers a balance of comfort, capability, and efficiency. With bold styling, advanced tech, and versatile cargo space, it’s built to handle your daily drive and weekend adventures with ease."
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
    price: 33000,
    description: "The 2025 RAV4 Hybrid is the perfect car for you! It offers exceptional mileage and smooth AWD performance, making it the ideal SUV for both city commutes and scenic escapes. With responsive acceleration and an upscale interior, it’s efficient, capable, and ready for anything."
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
    price: 41000,
    description: "The 2025 RAV4 Plug-in Hybrid is the perfect car for you! It combines electric driving for short trips with hybrid power for long adventures. Offering strong performance, standard AWD, and premium comfort, it’s an eco-friendly SUV designed to go wherever life takes you."
  },
  {
    name: "bZ4X",
    bodyStyle: "SUV",
    usage: ["Daily commuting", "Leisure"],
    drivingExperience: ["Smooth & comfortable"],
    engineType: ["Electric"],
    seats: 5,
    driveType: ["AWD", "FWD"],
    trimLevels: ["EX", "Luxury"],
    priority: ["Fuel efficiency"],
    price: 42000,
    description: "The 2025 bZ4X is the perfect car for you! As Toyota’s cutting-edge all-electric SUV, it offers zero-emission driving with advanced technology and bold design. With available AWD and intuitive infotainment, it’s the ideal blend of innovation, comfort, and sustainability."
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
    price: 38000,
    description: "The 2025 Highlander is the perfect car for you! Spacious, powerful, and family-ready, it offers three rows of comfort and advanced safety features. Whether it’s a road trip or daily errands, the Highlander’s strong performance and refined interior make every journey memorable."
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
    price: 42000,
    description: "The 2025 Highlander Hybrid is the perfect car for you! Combining family-sized comfort with hybrid efficiency, it offers room for seven and the confidence of AWD. Quiet, capable, and fuel-saving, it’s designed to make family adventures more enjoyable and economical."
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
    price: 55000,
    description: "The 2025 Land Cruiser is the perfect car for you! Reimagined with hybrid power and legendary toughness, it conquers any terrain with confidence. Combining off-road mastery with modern luxury, it’s built for those who demand adventure, durability, and sophistication in one package."
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
    price: 31000,
    description: "The 2025 Tacoma is the perfect truck for you! Tough, dependable, and ready for action, it’s built to handle both rugged trails and demanding workdays. With bold styling, advanced off-road tech, and proven reliability, Tacoma continues to set the benchmark for midsize pickups."
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
    price: 42000,
    description: "The 2025 Tacoma i-FORCE MAX is the perfect truck for you! It takes the rugged Tacoma formula and amplifies it with hybrid power, delivering incredible torque and efficiency. Perfect for towing, hauling, and trailblazing, it’s the ideal companion for serious work and weekend adventure."
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
    price: 40000,
    description: "The 2025 Tundra is the perfect truck for you! Strong, capable, and built to last, it offers immense towing power and a refined interior for comfort on every job. Whether on the highway or the worksite, the Tundra delivers reliability and strength you can count on."
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
    price: 52000,
    description: "The 2025 Tundra i-FORCE MAX is the perfect truck for you! With a hybrid powertrain that delivers incredible torque, it’s engineered for towing, hauling, and conquering off-road challenges. Blending brute strength with advanced tech, it’s the future of full-size truck performance."
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
    price: 49500,
    description: "The 2025 Mirai is the perfect car for you! Powered by hydrogen fuel cell technology, it delivers zero-emission driving with premium refinement. Elegant, futuristic, and effortless to drive, the Mirai represents the next generation of clean luxury sedans."
  }
];



const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
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