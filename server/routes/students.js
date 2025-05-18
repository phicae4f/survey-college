import { Router } from "express";
import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const userRoutes = new Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const tokenBlackList = new Set();

const generateToken = (email) => {
  return jwt.sign({ email }, "jwt-secret-key", { expiresIn: "1h" });
};

const authenticateTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  if (tokenBlackList.has(token)) {
    return res
      .status(401)
      .json({ error: "Токен истёк. Необходимо авторизоваться" });
  }
  jwt.verify(token, "jwt-secret-key", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

userRoutes.post("/", async (req, res) => {
  try {
    const { email, course_id, performance_level_id, specialization_id } =
      req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const [courseRows] = await db.query("SELECT id FROM courses WHERE id = ?", [
      course_id,
    ]);
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

    const token = generateToken(email);

    return res.status(201).json({
      success: true,
      email,
      token,
      message: "Регистрация успешно завершена",
    });
  } catch (error) {
    console.log("Ошибка регистрации: ", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.put("/:email", authenticateTokenMiddleware, async (req, res) => {
  try {
    if (req.user.email !== req.params.email) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    const email = req.params.email;
    const { course_id, performance_level_id, specialization_id } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const [[course]] = await db.query("SELECT id FROM courses WHERE id = ?", [
      course_id,
    ]);
    const [[performance]] = await db.query(
      "SELECT id FROM performance_levels WHERE id = ?",
      [performance_level_id]
    );
    const [[specialization]] = await db.query(
      "SELECT id FROM specializations WHERE id = ?",
      [specialization_id]
    );

    if (!course || !performance || !specialization) {
      return res
        .status(400)
        .json({ error: "Неверные данные курса, успеваемости или направления" });
    }

    const [result] = await db.query(
      `UPDATE students 
       SET course_id = ?, performance_level_id = ?, specialization_id = ?
       WHERE email = ?`,
      [course_id, performance_level_id, specialization_id, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Студент не найден" });
    }

    return res.json({ success: true, message: "Профиль обновлен" });
  } catch (error) {
    console.error("Ошибка обновления:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.get("/:email", authenticateTokenMiddleware, async (req, res) => {
  try {
    if (req.user?.email !== req.params.email) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    const { email } = req.params;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const [[student]] = await db.query(
      `SELECT s.email, c.number AS course, sp.name AS specialization, 
              pl.level AS performance_level
       FROM students s
       JOIN courses c ON s.course_id = c.id
       JOIN specializations sp ON s.specialization_id = sp.id
       JOIN performance_levels pl ON s.performance_level_id = pl.id
       WHERE s.email = ?`,
      [email]
    );

    if (!student) {
      return res.status(404).json({ error: "Студент не найден" });
    }

    return res.json({
      email: student.email,
      course: student.course,
      specialization: student.specialization,
      performance_level: student.performance_level,
    });
  } catch (error) {
    console.error("Ошибка получения данных:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

userRoutes.post("/logout", authenticateTokenMiddleware, (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    tokenBlackList.add(token);
  }

  return res.json({ success: true, message: "Успешный выход из системы" });
});

userRoutes.post("/login", async (req, res) => {
  try {
    const {email} = req.body

    const [user] = await db.query(
     "SELECT email FROM students WHERE email = ?", 
     [email] 
    )

    if(!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const token = generateToken(email)
    return res.json({
      success: true,
      email,
      token,
      message: "Вы успешно вошли в аккаунт!"
    })
  } catch (error) {
    console.error("Ошибка входа: ", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
})

userRoutes.get("/:studentId/test-status", async (req, res) => {
  try {
    const {studentId} = req.params
    const [[testStatus]] = await db.query(
      'SELECT test_passed FROM student_tests WHERE student_id = ?',
      [studentId]
    )
    res.json({hasPassedTest: !!testStatus?.test_passed})
  } catch (error) {
    console.error('Error checking test status:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
})

userRoutes.post("/:studentId/complete-test", async (req, res) => {
  try {
    const {studentId} = req.params
    await db.query(
      'INSERT INTO student_tests (student_id, test_passed) VALUES (?, true) ' +
      'ON DUPLICATE KEY UPDATE test_passed = true',
      [studentId]
    )
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking test as completed:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
})

userRoutes.get("/get-id", async (req, res) => {
  try {
    const {email} = req.query
    const [[student]] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    )
    res.json({id: student?.id || null})
  } catch (error) {
    console.error("Error getting student ID:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
})