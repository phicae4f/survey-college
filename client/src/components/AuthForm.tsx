import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { loginStudent } from "../api/students";
import { useState } from "react";
import { CustomInput } from "./ui/CustomInput";
import { CiUser } from "react-icons/ci";
import { Link as RouterLink } from "react-router-dom";

interface LoginData {
  email: string;
}

export const AuthForm = () => {
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
      login(data.email, data.token, "student");
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
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <CiUser className="auth-form__icon" size={100} />
      <div className="auth-form__fields">
        <CustomInput
          type="email"
          placeholder="Email"
          id="email"
          error={errors.email?.message}
          {...register("email", { required: "Email обязателен",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Некорректный email"
            }
           })}
        />
        {errors.email && (
          <span className="auth-form__error">{errors.email.message}</span>
        )}
      </div>
      <button className="auth-form__btn" type="submit" disabled={isPending}>
        {isPending ? "загрузка..." : "войти"}
      </button>
      <div className="auth-form__links">
        <RouterLink className="auth-form__link" to="/register">
          зарегистрироваться
        </RouterLink>
        <RouterLink className="auth-form__link" to="/admin/login">
          войти как админ
        </RouterLink>
      </div>
      {formError && <div className="auth-form__error-message">{formError}</div>}
    </form>
  );
};
