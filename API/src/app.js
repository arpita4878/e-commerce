import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { connectDB } from "./config/db.js";
const app = express();

import userRouter from "./routes/user.route.js"
import productRoutes from "./routes/product.route.js";
import inventoryRoutes from "./routes/Invetory.route.js";
import searchRoutes from './routes/search.route.js';
import branchRoutes from './routes/branch.route.js'
import orderRoutes from './routes/order.route.js'
import deliveryZoneRoutes from './routes/delivery.route.js';
import reportRoutes from './routes/report.route.js'

const port = process.env.PORT || 5000;

app.use(cors())

app.use(express.json()); 
app.use(express.urlencoded({extended:true}))
app.use(cookieParser()); 

app.use("/users",userRouter)

// app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/delivery-zones", deliveryZoneRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});