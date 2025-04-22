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
  TextField,
  MenuItem,
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
  const [isEditing, setIsEditing] = useState(false);

  const getErrorMessage = (error: unknown) => {
    try {
      if (typeof error === "string") {
        const parsed = JSON.parse(error);
        return parsed.error || parsed.message || error;
      }
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          return parsed.error || parsed.message || error.message;
        } catch {
          return error.message;
        }
      }
      return "Неизвестная ошибка";
    } catch {
      return "Неизвестная ошибка";
    }
  };

  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<StudentProfile>({
    queryKey: ["profile", userEmail],
    queryFn: () => getStudent(userEmail),
    enabled: !!userEmail,
    retry: false,
  });

  const [editData, setEditData] = useState({
    course: 1,
    specialization: "",
    performance_level: "",
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        course: profile.course,
        specialization: profile.specialization,
        performance_level: profile.performance_level,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateStudent(userEmail, {
        course_id: editData.course,
        specialization_id: specializations.indexOf(editData.specialization) + 1,
        performance_level_id:
          performanceLevels.indexOf(editData.performance_level) + 1,
      }),
    onSuccess: () => {
      refetch();
      setIsEditing(false);
    },
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
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate();
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditData({
        course: profile.course,
        specialization: profile.specialization,
        performance_level: profile.performance_level,
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

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
        <Alert severity="error">
          Ошибка загрузки профиля: {JSON.parse(error.message).error}
        </Alert>
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

          {isEditing ? (
            <>
              <TextField
                select
                fullWidth
                label="Курс"
                value={editData.course}
                onChange={(e) => handleChange("course", Number(e.target.value))}
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
                value={editData.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
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
                value={editData.performance_level}
                onChange={(e) =>
                  handleChange("performance_level", e.target.value)
                }
              >
                {performanceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </>
          ) : (
            <>
              <Typography>
                <strong>Курс:</strong> {profile.course}
              </Typography>
              <Typography>
                <strong>Специализация:</strong> {profile.specialization}
              </Typography>
              <Typography>
                <strong>Уровень знаний:</strong> {profile.performance_level}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>

      {isEditing ? (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Сохранить"
            )}
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Отмена
          </Button>
        </Box>
      ) : (
        <Button variant="contained" onClick={handleEdit} sx={{ mb: 2 }}>
          Редактировать профиль
        </Button>
      )}

      <Button variant="contained" color="error" onClick={handleLogout}>
        Выйти
      </Button>

      {updateMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Ошибка при обновлении: {getErrorMessage(updateMutation.error)}
        </Alert>
      )}
    </Box>
  );
}
