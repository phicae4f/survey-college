import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper, CircularProgress } from "@mui/material";

export default function TestPage() {
  const { markTestAsPassed, hasPassedTest } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если тест уже пройден или пользователь не студент - перенаправляем
  if (hasPassedTest) {
    navigate("/dashboard");
    return null;
  }

  const handleCompleteTest = async () => {
    setIsSubmitting(true);
    try {
      await markTestAsPassed();
      // Здесь можно добавить логику сохранения результатов теста
      navigate("/dashboard");
    } catch (error) {
      console.error("Ошибка при завершении теста:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тестирование
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {/* Здесь разместите ваш тест */}
        <Typography paragraph>
          Вопрос 1: Какой-то вопрос...
        </Typography>
        {/* Добавьте поля для ответов */}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCompleteTest}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} /> : "Завершить тест"}
      </Button>
    </Box>
  );
}