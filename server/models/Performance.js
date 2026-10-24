
import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    qualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    deliveryScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    costScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    evaluationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
