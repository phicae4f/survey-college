import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { registerAdmin } from "../api/admins"

interface FormData {
    email: string,
    password: string
}

export default function AdminRegisterPage() {
    const [formError, setFormError] = useState<string | null>(null)
    const {login} = useAuth()
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>()

    const {mutate, isPending} = useMutation({
        mutationFn: registerAdmin,
        onSuccess: (data) => {
            login(data.email, data.token, data.is_super_admin ?  "super_admin" : "admin")
        }
    })
    return <>AdminRegisterPage</>
}