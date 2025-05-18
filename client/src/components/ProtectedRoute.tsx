import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { JSX } from "react"

const ProtectedRoute = ({children, allowedRoles = ['student', 'admin', 'super_admin']}: { 
    children: JSX.Element,
    allowedRoles?: ('student' | 'admin' | 'super_admin')[] 
  }) => {
    const {isAuthenticated, role} = useAuth()
    const location = useLocation()

    if(!isAuthenticated || !role ||!allowedRoles.includes(role)) {
        return <Navigate to="/login" state={{from: location}} replace />
    }

    return children
}

export default ProtectedRoute