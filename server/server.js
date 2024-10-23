import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
dotenv.config();
import authRouter from "./routes/authRoute.js";
import blogRouter from "./routes/blogRoute.js";
import commentRouter from "./routes/commentRoute.js";
import cors from "cors";

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api/v1/auth", authRouter);
server.use("/api/v1/blog", blogRouter);
server.use("/api/v1/comment", commentRouter);
server.get("/", (req, res) => {
  res.send("server running");
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`server is started on the port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("error", error);
  }
};

startServer();
