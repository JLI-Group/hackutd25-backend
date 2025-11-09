import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bodyStyle: { type: String, enum: ["Sedan", "SUV", "Truck", "Mini-van"] },
  usage: { type: [String], enum: ["Daily commuting", "Off-road", "Work", "Leisure"] },
  drivingExperience: { type: [String], enum: ["Smooth & comfortable", "Sporty & responsive", "Off-road capable"] },
  engineType: { type: [String], enum: ["Gasoline", "Hybrid", "Electric"] },
  seats: { type: Number, enum: [2, 4, 5, 7] },
  driveType: { type: [String], enum: ["AWD", "RWD", "FWD"] },
  trimLevels: { type: [String], enum: ["Base", "Sport", "EX", "Luxury"] },
  priority: { type: [String], enum: ["Fuel efficiency", "Power"] },
});

export default mongoose.model("Car", CarSchema);