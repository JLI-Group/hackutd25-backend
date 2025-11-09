import mongoose from "mongoose";

const AprSchema = new mongoose.Schema({
    tier: { type: String, required: true, enum: ["SuperPrime", "Prime", "Non-Prime", "SubPrime", "Deep-SubPrime"] },
    rate: { type: Number, required: true },
})

export default mongoose.model("Apr", AprSchema);