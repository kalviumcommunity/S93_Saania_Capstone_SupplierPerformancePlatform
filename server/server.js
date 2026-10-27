
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import Supplier from "./models/Supplier.js";
import Performance from "./models/Performance.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Supplier Performance API is running",
  });
});

// GET: Search and filter suppliers
app.get("/api/suppliers", async (req, res) => {
  try {
    const { search, status, category } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const suppliers = await Supplier.find(filter);

    res.status(200).json({
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch suppliers",
      error: error.message,
    });
  }
});

// WRITE: Create a supplier in MongoDB
app.post("/api/suppliers", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ: Get all performance records
app.get("/api/performance", async (req, res) => {
  try {
    const records = await Performance.find().populate("supplier");
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WRITE: Create a performance record
app.post("/api/performance", async (req, res) => {
  try {
    const record = await Performance.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing in the .env file");
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}
