import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import taskRouter from "./routes/taskRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
// automatically parse incoming json
mongoose.set("strictPopulate", false);
// Get the __filename and __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cors()); // allows requests from anywhere
// app.use(
//   cors({
//     origin: "https://kanban-task-management-app-frontend.vercel.app/",
//   })
// );

app.options("*", cors());
app.use(taskRouter);
app.use(userRouter);
app.use(boardRouter);
//use client
app.use(express.static(path.join(__dirname, "/client/dist")));

// render client for any path
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/dist/index.html"))
);

app.get("/", (req, res) => {
  console.log(req);
  return res.status(234).send("Welcome to kanban task managment app");
});

async function connect() {
  try {
    console.log(process.env.DB);
    await mongoose.connect(process.env.DB);
    console.log("App connected to database");
    app.listen(process.env.PORT, () => {
      console.log(`Now listening on port:${process.env.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}
connect();
