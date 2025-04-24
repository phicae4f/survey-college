import bcrypt from "bcrypt";
import { Router } from "express";
import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const adminRoutes = new Router();
const salt = 10;

// const checkAdminMiddleware = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "Нет токена" });

//     jwt.verify(token, "jwt-secret-key", (err, user) => {
//         if(err || !user.is_admin) {
//             return res.status(403).json({ error: "Нет прав админа" });  
//         }
//         req.user = user
//         next()
//     })
// }

adminRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [[admin]] = await db.query("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);

    if (!admin) {
      return res.status(404).json({ error: "Админ не найден" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const token = jwt.sign(
      {
        email: admin.email,
        is_admin: true,
        is_super_admin: admin.is_super_admin,
      },
      "jwt-secret-key",
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      token,
      email: admin.email,
      is_admin: true,
      is_super_admin: admin.is_super_admin,
    });
  } catch (error) {
    console.error("Ошибка входа админа:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

adminRoutes.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(token, "jwt-secret-key");
    const [[superAdmin]] = await db.query(
      "SELECT is_super_admin FROM admins WHERE email = ?",
      [decoded.email]
    );

    if (!superAdmin?.is_super_admin) {
      return res
        .status(403)
        .json({
          error: "Только главный админ может регистрировать новых админов",
        });
    }

    const [[existingAdmin]] = await db.query(
        "SELECT id FROM admins WHERE email = ?",
        [email]
      );
      if (existingAdmin) {
        return res.status(409).json({ error: "Админ с таким email уже существует" });
      }

    const hash = await bcrypt.hash(password, salt);
    await db.query("INSERT INTO admins (email, password_hash) VALUES (?, ?)", [
      email,
      hash,
    ]);
    return res.json({ success: true, message: "Админ зарегистрирован", email });
  } catch (error) {
    console.error("Ошибка регистрации админа:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});
