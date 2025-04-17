import { Router } from "express";
import { db } from "../db.js";

export const userRoutes = new Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

userRoutes.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const [existing] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email уже зарегистрирован" });
    }

    await db.query(`INSERT INTO students (email) VALUES (?)`, [email]);

    return res.status(201).json({ success: true, email, message: "Регистрация успешно завершена" });
  } catch (error) {
    console.log("Ошибка регистрации: ", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.put("/:email", async (req, res) => {
  try {
      const {email} = req.params.email;
      const { course, major, academic_performance } = req.body;

      if(!isValidEmail(email)) {
        return res.status(400).json({error: "Некорректный email"})
      }

      const [result] = await db.query(
        `UPDATE students 
           SET course = ?, major = ?, academic_performance = ?
           WHERE email = ?`,
        [course, major, academic_performance, email]
      );

      if(result.affectedRows === 0) {
        return res.status(404).json({ error: "Студент не найден" });
      }

    
    return res.json({ success: true, message: "Профиль обновлен" });
  } catch (error) {
    console.error("Ошибка обновления:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.get("/:email", async (req, res) => {
  try {
    const {email} = req.params
    if(!isValidEmail(email)) {
        return res.status(400).json({error: "Некорректный email"})
    }
    const [student] = await db.query(
      "SELECT email, course, major, academic_performance FROM students WHERE email = ?",
      [email]
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
