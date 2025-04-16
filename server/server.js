import express from "express";
import cors from "cors";
import { createUsersTables } from "./db.js";
import { questionsRouter } from "./routes/questions.js";
import { db } from "./db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

createUsersTables();
// app.use("/api/questions", questionsRouter)

app.post("/api/register", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const [existing] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(403).json({ error: "Email уже зарегистрирован" });
    }

    await db.query(`INSERT INTO students (email) VALUES (?)`, [email]);

    return  res.status(201).json({ success: true, email });
  } catch (error) {
    console.log("Ошибка регистрации: ", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/api/register/:email", async (req, res) => {
  try {
    const { course, major, academic_performance } = req.body;
    const email = req.params.email;

    await db.query(
      `UPDATE students 
       SET course = ?, major = ?, academic_performance = ?
       WHERE email = ?`,
      [course, major, academic_performance, email]
    );
    return res.status(500).json({ success: true, message: "Профиль обновлен" });
  } catch (error) {
    console.error("Ошибка обновления:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/api/students/:email", async (req, res) => {
  try {
    const [student] = await db.query(
      "SELECT email, course, major, academic_performance FROM students WHERE email = ?",
      [req.params.email]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: "Студент не найден" });
    }

    return res.json(student[0]);
  } catch (error) {
    console.error("Ошибка получения данных:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log("server is running on port: ", PORT);
});
