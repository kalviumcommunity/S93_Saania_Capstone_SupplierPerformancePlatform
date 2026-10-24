
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
