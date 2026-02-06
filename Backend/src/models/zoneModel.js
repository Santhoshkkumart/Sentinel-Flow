import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    inflowRate: {
      type: Number, // people per minute
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: "green",
    },
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);
export default Zone;
