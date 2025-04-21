import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getStudent, logoutStudent, updateStudent } from "../api/students";
import { courses, specializations, performanceLevels } from "../data/data";
import { useEffect, useState } from "react";

interface StudentProfile {
  email: string;
  course: number;
  specialization: string;
  performance_level: string;
}

interface StudentProfileUpdate {
  course_id: number;
  specialization_id: number;
  performance_level_id: number;
}

export default function DashboardPage() {
  const { logout, userEmail } = useAuth();
  const [isEditing, setIsEditing] = useState(false)

  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch
  } = useQuery<StudentProfile>({
    queryKey: ["profile", userEmail],
    queryFn: () => getStudent(userEmail),
    enabled: !!userEmail,
    retry: false,
  });

  const [editData, setEditData] = useState({
    course: 1,
    specialization: '',
    performance_level: ''
  });

  useEffect(() => {
    if(profile) {
      setEditData({
        course: profile.course,
        specialization: profile.specialization,
        performance_level: profile.performance_level,
      });
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: () => 
      updateStudent(userEmail, {
        course_id: editData.course,
        specialization_id: specializations.indexOf(editData.specialization) + 1,
        performance_level_id: performanceLevels.indexOf(editData.performance_level) + 1
      }),
      onSuccess: () => {
        refetch()
        setIsEditing(false)
      }
  });

  const handleLogout = async () => {
    try {
      await logoutStudent();
      logout();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate()
  }

  
  if (isPending) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
        <Alert severity="error">Ошибка загрузки профиля: {error.message}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
        <Typography variant="h6">Профиль не найден</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography>
            <strong>Email:</strong> {profile.email}
          </Typography>
          <Typography>
            <strong>Курс:</strong> {profile.course}
          </Typography>
          <Typography>
            <strong>Специализация:</strong> {profile.specialization}
          </Typography>
          <Typography>
            <strong>Уровень знаний:</strong> {profile.performance_level}
          </Typography>
        </Stack>
      </Paper>

      <Button variant="contained" color="error" onClick={handleLogout}>
        Выйти
      </Button>
    </Box>
  );
}
