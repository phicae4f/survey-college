import { createContext, ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (email: string, token: string | null) => void;
    logout: () => void;
    userEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem("token") !== null
    })
    const [userEmail, setUserEmail] = useState(() => {
        return localStorage.getItem("email") || ""
    })
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token")
    })

    const navigate = useNavigate()

    const login = (email:string, token: string) => {
        setIsAuthenticated(true)
        setUserEmail(email)
        setToken(token)
        localStorage.setItem("token", token)
        localStorage.setItem("email", email)
        navigate("/dashboard")
    }

    const logout = () => {
        setIsAuthenticated(false)
        setUserEmail("")
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        navigate("/login")
    }

    return (
        <AuthContext.Provider value={{userEmail, isAuthenticated, login, logout, token}}>
            {children}
        </AuthContext.Provider>
    )
}

//**кастомный хук */
export const useAuth = () => {
    const context = useContext(AuthContext)

    if(!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context
}