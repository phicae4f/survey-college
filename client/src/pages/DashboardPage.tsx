import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Button, Box, Typography, Paper, Stack, CircularProgress, Alert } from '@mui/material';
import { getStudent, logoutStudent } from '../api/students';


interface StudentProfile {
    email: string,
    course: number;
    specialization: string;
    performance_level: string;
}
export default function DashboardPage() {
  const { logout, userEmail } = useAuth();

  const { data: profile, isPending, isError, error } = useQuery<StudentProfile>({
    queryKey: ['profile', userEmail],
    queryFn: () => getStudent(userEmail),
    enabled: !!userEmail,
    retry: false
  })

  const handleLogout = async () => {
    try {
        await logoutStudent();
        logout();
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }
  };

  if (isPending) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '200px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Alert severity="error">
          Ошибка загрузки профиля: {error.message}
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
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Typography variant="h6">Профиль не найден</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>Личный кабинет</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography><strong>Email:</strong> {profile.email}</Typography>
          <Typography><strong>Курс:</strong> {profile.course}</Typography>
          <Typography><strong>Специализация:</strong> {profile.specialization}</Typography>
          <Typography><strong>Уровень знаний:</strong> {profile.performance_level}</Typography>
        </Stack>
      </Paper>

      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
      >
        Выйти
      </Button>
    </Box>
  );
}