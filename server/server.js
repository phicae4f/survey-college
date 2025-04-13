import express from "express";
import cors from "cors";
import mysql from "mysql";

const PORT = 8081;
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "survey-college",
});

async function createUsersTables() {
  try {
    await db.query(`
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          code VARCHAR(6),
          is_verified BOOLEAN DEFAULT FALSE,
          course INT,
          major VARCHAR(100),
          academic_performance ENUM('отлично', 'хорошо', 'удовлетворительно', 'неудовлетворительно'),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

    // Таблица преподавателей
    await db.query(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          department VARCHAR(100) NOT NULL
        )
      `);

    // Таблица вопросов
    await db.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text TEXT NOT NULL,
          category VARCHAR(50) NOT NULL,
          scale_description VARCHAR(200) DEFAULT '0 - Затрудняюсь ответить, 1 - Полностью не согласна/согласен, 2 - Скорее не согласна/согласен, 3 - Отчасти согласна/согласен отчасти нет, 4 - Скорее согласна/согласен, 5 - Полностью согласна/согласен'
        )
      `);

    // Таблица ответов (изменили тип answer на 0-5)
    await db.query(`
        CREATE TABLE IF NOT EXISTS survey_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          teacher_id INT NOT NULL,
          question_id INT NOT NULL,
          answer ENUM('0', '1', '2', '3', '4', '5') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (teacher_id) REFERENCES teachers(id),
          FOREIGN KEY (question_id) REFERENCES questions(id)
        )
      `);

    console.log("Все таблицы успешно созданы/проверены");
  } catch (error) {
    console.error("Ошибка при создании таблиц:", err);
  }
}

createUsersTables();

app.listen(PORT, () => {
  console.log("server is running on port: ", PORT);
});
