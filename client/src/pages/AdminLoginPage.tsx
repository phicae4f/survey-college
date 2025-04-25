import { useMutation } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { useForm } from "react-hook-form"
import { loginAdmin } from "../api/admins"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useState } from "react"

interface LoginData {
    email: string,
    password: string
}


export default function AdminLoginPage() {

    const {login} = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null);

    const {register, handleSubmit, formState: {errors}} = useForm<LoginData>()
    const {mutate, isPending} = useMutation({
        mutationFn: loginAdmin,
        onSuccess: (data) => {
            login(data.email, data.token, data.is_super_admin ?  "super_admin" : "admin")
            navigate("/admin/dashboard")
        },
        onError: (error) => {
            try {
                setError(JSON.parse(error.message).error)
            } catch (error) {
                setError(error.message)
            }
        }
    })

    const onSubmit = (data: LoginData) => {
        setError(null)
        mutate(data)
    }
    
    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Вход для админов
          </Typography>
    
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...register("email", { required: "Email обязателен" })}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              margin="normal"
              {...register("password", { required: "Пароль обязателен" })}
            />
    
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
    
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={isPending}
            >
              {isPending ? "Загрузка..." : "Войти"}
            </Button>
          </form>
        </Box>
      );
}