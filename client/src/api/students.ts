type StudentProfile = {
  email: string;
  course: number;
  specialization: string;
  performance_level: string;
};

type StudentProfileUpdate = {
  course_id: number;
  specialization_id: number;
  performance_level_id: number;
};

type RegistrationData = {
  email: string;
  course_id: number;
  specialization_id: number;
  performance_level_id: number;
};

type AuthResponse = {
  success: boolean;
  email: string;
  token: string;
  message: string;
};

const storeToken = (token: string) => {
  localStorage.setItem("token", token);
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const removeToken = () => {
  localStorage.removeItem("token");
};

export const registerStudent = async (
  data: RegistrationData
): Promise<AuthResponse> => {
  try {
    const res = await fetch("http://localhost:8081/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const response: AuthResponse = await res.json();
    storeToken(response.token);
    return response;
  } catch (error) {
    console.error("Ошибка регистрации: ", error);
    throw error;
  }
};

export const updateStudent = async (
  email: string,
  data: StudentProfileUpdate
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Необходимо авторизоваться");
    }

    const res = await fetch(`http://localhost:8081/api/students/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return await res.json();
  } catch (error) {
    console.error("Ошибка обновления профиля: ", error);
    throw error;
  }
};

export const getStudent = async (email: string): Promise<StudentProfile> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Необходимо авторизоваться");
    }

    const res = await fetch(`http://localhost:8081/api/students/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }
    return await res.json();
  } catch (error) {
    console.error("Ошибка получения профиля: ", error);
    throw error;
  }
};

export const logoutStudent = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: true, message: "Вы уже вышли из системы" };
    }

    const res = await fetch("http://localhost:8081/api/students/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    removeToken();
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return await res.json();
  } catch (error) {
    console.error("Ошибка выхода из аккаунта: ", error);
    throw error;
  }
};
