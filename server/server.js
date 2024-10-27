import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
dotenv.config();
import authRouter from "./routes/authRoute.js";
import blogRouter from "./routes/blogRoute.js";
import commentRouter from "./routes/commentRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import cors from "cors";
import path from "path";

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// API Routes
server.use("/api/v1/auth", authRouter);
server.use("/api/v1/blog", blogRouter);
server.use("/api/v1/comment", commentRouter);
server.use("/api/v1/notification", notificationRouter);

// Test route to check if the server is running
server.get("/", (req, res) => {
  res.send("server running");
});

// Serve frontend static files
const __dirname = path.resolve();
const frontendPath = path.join(
  __dirname,
  "..",
  "blogging website - frontend",
  "dist"
);
server.use(express.static(frontendPath));

// Catch-all route for SPA (React) to handle client-side routing
server.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server and connect to DB
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    server.listen(PORT, () => {
      console.log(`Server is started on the port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("error", error);
  }
};

startServer();
