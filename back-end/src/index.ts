import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as http from "http";
import cors = require("cors");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;
const dbUri = process.env.DB_URI;

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

if (!process.env.DB_URI) {
  throw new Error("DB_URI environment variable not set");
}

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database", error);
  });

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});
