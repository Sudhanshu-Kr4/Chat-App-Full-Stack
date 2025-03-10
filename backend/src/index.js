import express from "express";
import authRotes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { server,app } from "./lib/socket.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin : "http://localhost:5173",
  credentials:true
}));

app.use("/api/auth", authRotes)    // use method middleware
app.use("/api/message", messageRoutes)


server.listen(process.env.PORT, () => {
  console.log("server is running on port : ", process.env.PORT);
  connectDB();

})