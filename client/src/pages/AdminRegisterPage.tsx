import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { registerAdmin } from "../api/admins"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Typography } from "@mui/material"

interface FormData {
    email: string,
    password: string
}

export default function AdminRegisterPage() {
    const [formError, setFormError] = useState<string | null>(null)
    const {role} = useAuth()
    const navigate = useNavigate()
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>()

    const {mutate, isPending} = useMutation({
        mutationFn: registerAdmin,
        onSuccess: (data) => {
            navigate("/admin/dashboard", { state: { message: `Админ ${data.email} успешно зарегистрирован` } })
        },
        onError: (error) => {
            try {
                setFormError(JSON.parse(error.message).error)
            } catch (error) {
                setFormError(error.message)
            }
        }
    })

    if (role !== "super_admin") {
        return (
            <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }}>
                <Typography variant="h6" color="error">
                    Доступ запрещен. Только главный администратор может регистрировать новых админов.
                </Typography>
            </Box>
        )
    }

    const onSubmit = (data: FormData) => {
        setFormError(null)
        mutate(data)
    }
    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Регистрация нового админа
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    label="Email"
                    margin="normal"
                    {...register("email", { 
                        required: "Email обязателен",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Некорректный email"
                        }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    fullWidth
                    label="Пароль"
                    type="password"
                    margin="normal"
                    {...register("password", { 
                        required: "Пароль обязателен",
                        minLength: {
                            value: 6,
                            message: "Пароль должен быть не менее 6 символов"
                        }
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
                    {isPending ? "Регистрация..." : "Зарегистрировать"}
                </Button>
            </form>
        </Box>
    )
}