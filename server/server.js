
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Supplier from "./models/Supplier.js";
import Performance from "./models/Performance.js";
import User from "./models/User.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Supplier Performance API is running",
  });
});

// POST: Register a new user (public route)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters long",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const existingUser = await User.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: cleanUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// POST: Login and generate a JWT (public route)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// GET: Search and filter suppliers (protected)
app.get("/api/suppliers", authMiddleware, async (req, res) => {
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

    return res.status(200).json({
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch suppliers",
      error: error.message,
    });
  }
});

// POST: Create a supplier (protected)
app.post("/api/suppliers", authMiddleware, async (req, res) => {
  try {
    const { name, email, contactPerson, category, status } = req.body;

    if (!name || !email || !contactPerson || !category || !status) {
      return res.status(400).json({
        message:
          "name, email, contactPerson, category, and status are required",
      });
    }

    const supplier = await Supplier.create({
      name,
      email,
      contactPerson,
      category,
      status,
    });

    return res.status(201).json(supplier);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

// PUT: Update a supplier (protected)
app.put("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email, contactPerson, category, status } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (contactPerson !== undefined) updates.contactPerson = contactPerson;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update supplier",
      error: error.message,
    });
  }
});

// DELETE: Delete a supplier (protected)
app.delete("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      message: "Supplier deleted successfully",
      supplier,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
});

// GET: Get performance records (protected)
app.get("/api/performance", authMiddleware, async (req, res) => {
  try {
    const records = await Performance.find().populate("supplier");

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// POST: Create a performance record (protected)
app.post("/api/performance", authMiddleware, async (req, res) => {
  try {
    const {
      supplier,
      qualityScore,
      deliveryScore,
      costScore,
      overallScore,
      evaluationDate,
    } = req.body;

    if (
      !supplier ||
      qualityScore === undefined ||
      deliveryScore === undefined ||
      costScore === undefined ||
      overallScore === undefined
    ) {
      return res.status(400).json({
        message: "Supplier and all performance scores are required",
      });
    }

    if (!mongoose.isValidObjectId(supplier)) {
      return res.status(400).json({
        message: "Invalid supplier ID",
      });
    }

    const existingSupplier = await Supplier.findById(supplier);

    if (!existingSupplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    const performanceData = {
      supplier,
      qualityScore,
      deliveryScore,
      costScore,
      overallScore,
    };

    if (evaluationDate !== undefined) {
      performanceData.evaluationDate = evaluationDate;
    }

    const record = await Performance.create(performanceData);

    const populatedRecord = await Performance.findById(record._id)
      .populate("supplier");

    return res.status(201).json(populatedRecord);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
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
