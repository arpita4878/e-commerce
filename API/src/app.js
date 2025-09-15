import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
  import { fileURLToPath } from 'url';
import path from 'path'
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger.js";  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// const swaggerFile = JSON.parse(
//   fs.readFileSync(path.join(__dirname, "../swagger-output.json"), "utf-8")
// );


import userRouter from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import inventoryRoutes from "./routes/Invetory.route.js";
import searchRoutes from './routes/search.route.js';
import branchRoutes from './routes/branch.route.js';
import orderRoutes from './routes/order.route.js';
import deliveryZoneRoutes from './routes/delivery.route.js';
import reportRoutes from './routes/report.route.js';
import CategoryRouter from './routes/category.router.js'
import BrandRouter from './routes/brand.route.js'

const app = express();
const port = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


global._io = io;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRouter);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/delivery-zones", deliveryZoneRoutes);
app.use("/api/category",CategoryRouter)
app.use("/api/brand",BrandRouter)

app.post("/notify/order", (req, res) => {
  const { branchId, orderId, status } = req.body;
  if (!branchId || !orderId) {
    return res.status(400).json({ message: "branchId and orderId are required" });
  }

  
  io.to(String(branchId)).emit("newOrder", {
    branchId,
    orderId,
    status: status || "pending",
    time: new Date(),
  });

  res.json({ message: "Notification sent", branchId, orderId });
});

// Socket.IO handlers
io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);

  // Branch joins its own room
  socket.on("joinBranch", (branchId) => {
    socket.join(String(branchId));
    console.log(` Branch ${branchId} joined via socket ${socket.id}`);
  });

  // Delivery boy 
  socket.on("joinDeliveryBoy", (deliveryBoyId) => {
    socket.join(`delivery_${deliveryBoyId}`);
    console.log(` Delivery Boy ${deliveryBoyId} joined via socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});


connectDB().then(() => {
  httpServer.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
  });
});
