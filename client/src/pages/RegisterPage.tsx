import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { registerStudent } from "../api/students";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

interface FormData {
  email: string;
  course: number;
  specialization: string;
  performanceLevel: string;
}

const courses = [1, 2, 3, 4, 5];
const specializations = [
  "Строительство",
  "Прикладная информатика",
  "Информационная безопасность",
  "Землеустройство и кадастр",
  "Экономика (Бухучет)",
  "Экономика (Налоги и налогообложение)",
  "Экономика (Финансы и кредит)",
  "Экономика (Honors)",
  "Менеджмент",
  "Бизнес-информатика",
  "Торговое дело",
  "Юриспруденция",
  "Лингвистика",
];
const performanceLevels = [
  'Учусь только на "хорошо" и "отлично"',
  'У меня в основном "хорошо" и "отлично", но есть и "удовлетворительно"',
  'У меня в основном "удовлетворительные" оценки',
];
export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { mutate, isPending} = useMutation({
    mutationFn: registerStudent,
    onSuccess: (data) => {
      login(data.email, data.token);
    },
    onError: (error) => {
      setFormError(JSON.parse(error.message).error)
    }
  });

  const onSubmit = (data: FormData) => {
    setFormError(null)
    mutate({
      email: data.email,
      course_id: data.course,
      specialization_id: specializations.indexOf(data.specialization) + 1,
      performance_level_id:
        performanceLevels.indexOf(data.performanceLevel) + 1,
    });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Регистрация
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          {...register("email", { required: "Email обязателен" })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          select
          fullWidth
          label="Курс"
          margin="normal"
          defaultValue=""
          {...register("course", { required: "Выберите курс" })}
          error={!!errors.course}
          helperText={errors.course?.message}
        >
          {courses.map((course) => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Специализация"
          margin="normal"
          defaultValue=""
          {...register("specialization", {
            required: "Выберите специализацию",
          })}
          error={!!errors.specialization}
          helperText={errors.specialization?.message}
        >
          {specializations.map((spec) => (
            <MenuItem key={spec} value={spec}>
              {spec}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Уровень знаний"
          margin="normal"
          defaultValue=""
          {...register("performanceLevel", {
            required: "Укажите уровень знаний",
          })}
          error={!!errors.performanceLevel}
          helperText={errors.performanceLevel?.message}
        >
          {performanceLevels.map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </TextField>
        {formError && (
          <Typography color="error" sx={{ mt: 2 }}>
          {formError}
        </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={isPending}
        >
          Зарегистрироваться
        </Button>

        <Typography sx={{ mt: 2 }}>
          Уже есть аккаунт?{" "}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </Typography>
      </form>
    </Box>
  );
}
