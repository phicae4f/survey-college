import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { loginStudent } from "../api/students";
import { useState } from "react";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface LoginData {
  email: string;
}
export default function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const { mutate, isPending } = useMutation({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      login(data.email, data.token);
    },
    onError: (error) => {
      setFormError(JSON.parse(error.message).error);
    },
  });

  const onSubmit = (data: LoginData) => {
    setFormError(null);
    mutate(data.email);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Вход
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
          Войти
        </Button>

        <Typography sx={{ mt: 2 }}>
          Нет аккаунта?{" "}
          <Link component={RouterLink} to="/register">
            Зарегистрироваться
          </Link>
        </Typography>
      </form>
    </Box>
  );
}
