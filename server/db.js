import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "survey-college1",
});

export async function createTables() {
  try {
    //Направления
    await db.query(`
      CREATE TABLE IF NOT EXISTS specializations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
)
      `);
    //Курсы
    await db.query(`
        CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number TINYINT NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 5)
)
        `);

    //Успеваемость
    await db.query(`
      CREATE TABLE IF NOT EXISTS performance_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(50) NOT NULL UNIQUE
)
      `);

    //Студенты
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    course_id INT NOT NULL,
    performance_level_id INT NOT NULL,
    specialization_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (performance_level_id) REFERENCES performance_levels(id),
    FOREIGN KEY (specialization_id) REFERENCES specializations(id)
)
      `);
    //Предметы
    await db.query(`
        CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
)
        `);

    //Преподаватели
    await db.query(`
        CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
)
        `);

    //Вопросы
    await db.query(`
        CREATE TABLE IF NOT EXISTS rating_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    max_score TINYINT NOT NULL DEFAULT 5 CHECK (max_score BETWEEN 1 AND 5)
)
        `);
    //Оценка преподавателей
    await db.query(`
          CREATE TABLE IF NOT EXISTS teacher_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    rating_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rating (student_id, teacher_id), -- Обеспечиваем одну оценку от студента
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
)
          `);
    //ДЕтали ответа на вопросы
    await db.query(`
            CREATE TABLE IF NOT EXISTS rating_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rating_id INT NOT NULL,
    question_id INT NOT NULL,
    score TINYINT NOT NULL CHECK (score BETWEEN 0 AND 5),
    UNIQUE KEY unique_response (rating_id, question_id), -- Один ответ на вопрос в оценке
    FOREIGN KEY (rating_id) REFERENCES teacher_ratings(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES rating_questions(id)
)
            `);

    console.log("Все таблицы успешно созданы/проверены");
  } catch (error) {
    console.error("Ошибка при создании таблиц:", error);
  }
}

// export const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "survey-college",
// });

// export async function createUsersTables() {
//   try {
//     await db.query(`
//           CREATE TABLE IF NOT EXISTS students (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             email VARCHAR(255) NOT NULL UNIQUE,
//             course INT,
//             major VARCHAR(100),
//             academic_performance ENUM('отлично', 'хорошо', 'удовлетворительно', 'неудовлетворительно'),
//             has_completed_survey BOOLEAN DEFAULT FALSE,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//     // Таблица преподавателей
//     await db.query(`
//           CREATE TABLE IF NOT EXISTS teachers (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             name VARCHAR(100) NOT NULL,
//             department VARCHAR(100) NOT NULL
//           )
//         `);

//     // Таблица вопросов
//     await db.query(`
//           CREATE TABLE IF NOT EXISTS questions (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             text TEXT NOT NULL,
//             category VARCHAR(50) NOT NULL,
//             scale_description VARCHAR(200) DEFAULT '0 - Затрудняюсь ответить, 1 - Полностью не согласна/согласен, 2 - Скорее не согласна/согласен, 3 - Отчасти согласна/согласен отчасти нет, 4 - Скорее согласна/согласен, 5 - Полностью согласна/согласен'
//           )
//         `);

//     // Таблица ответов (изменили тип answer на 0-5)
//     await db.query(`
//           CREATE TABLE IF NOT EXISTS survey_responses (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             student_id INT NOT NULL,
//             teacher_id INT NOT NULL,
//             question_id INT NOT NULL,
//             answer ENUM('0', '1', '2', '3', '4', '5') NOT NULL,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (student_id) REFERENCES students(id),
//             FOREIGN KEY (teacher_id) REFERENCES teachers(id),
//             FOREIGN KEY (question_id) REFERENCES questions(id)
//           )
//         `);

//     console.log("Все таблицы успешно созданы/проверены");
//   } catch (error) {
//     console.error("Ошибка при создании таблиц:", error);
//   }
// }
