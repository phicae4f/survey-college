import { Router } from "express";
import { db } from "../db.js";

export const userRoutes = new Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

userRoutes.post("/", async (req, res) => {
  try {
    const { email, course_id, performance_level_id, specialization_id } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    // Исправленные запросы с правильной обработкой результатов
    const [courseRows] = await db.query(
      "SELECT id FROM courses WHERE id = ?",
      [course_id]
    );
    const [performanceRows] = await db.query(
      "SELECT id FROM performance_levels WHERE id = ?",
      [performance_level_id]
    );
    const [specializationRows] = await db.query(
      "SELECT id FROM specializations WHERE id = ?",
      [specialization_id]
    );

    if (
      !courseRows?.length ||
      !performanceRows?.length ||
      !specializationRows?.length
    ) {
      return res
        .status(400)
        .json({ error: "Неверные данные курса, успеваемости или направления" });
    }

    const [existingRows] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existingRows?.length > 0) {
      return res.status(409).json({ error: "Email уже зарегистрирован" });
    }

    await db.query(
      `INSERT INTO students (email, course_id, performance_level_id, specialization_id) 
       VALUES (?, ?, ?, ?)`,
      [email, course_id, performance_level_id, specialization_id]
    );

    return res
      .status(201)
      .json({ success: true, email, message: "Регистрация успешно завершена" });
  } catch (error) {
    console.log("Ошибка регистрации: ", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.put("/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const { course_id, performance_level_id, specialization_id } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const courseExists = await db.query(
      "SELECT id FROM courses WHERE id = ?",
      [course_id]
    );
    const performanceExists = await db.query(
      "SELECT id FROM performance_levels WHERE id = ?",
      [performance_level_id]
    );
    const specializationExists = await db.query(
      "SELECT id FROM specializations WHERE id = ?",
      [specialization_id]
    );

    if (
      !courseExists[0].length ||
      !performanceExists[0].length ||
      !specializationExists[0].length
    ) {
      return res
        .status(400)
        .json({ error: "Неверные данные курса, успеваемости или направления" });
    }

    const result = await db.query(
      `UPDATE students 
       SET course_id = ?, performance_level_id = ?, specialization_id = ?
       WHERE email = ?`,
      [course_id, performance_level_id, specialization_id, email]
    );

    if (result[0].affectedRows === 0) {
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
    const { email } = req.params;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }
    const student = await db.query(
      `SELECT s.email, c.number AS course, sp.name AS specialization, pl.level AS performance_level
      FROM students s
      JOIN courses c ON s.course_id = c.id
      JOIN specializations sp ON s.specialization_id = sp.id
      JOIN performance_levels pl ON s.performance_level_id = pl.id
      WHERE s.email = ?`,
      [email]
    );

    if (student[0].length === 0) {
      return res.status(404).json({ error: "Студент не найден" });
    }

    return res.json(student[0][0]);
  } catch (error) {
    console.error("Ошибка получения данных:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});
