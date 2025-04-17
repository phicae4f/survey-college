import express from "express";
import cors from "cors";
import { createUsersTables } from "./db.js";
import { userRoutes } from "./routes/students.js";

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

createUsersTables();
app.use("/api/students", userRoutes)


app.listen(PORT, () => {
  console.log("server is running on port: ", PORT);
});
