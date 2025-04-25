type LoginAdminResponse = {
  success: boolean;
  token: string;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
  message?: string;
};

type RegisterAdminResponse = {
  success: boolean;
  message: string;
  email: string;
};

export const loginAdmin = async (
  data: {
    email: string,
    password: string
  }
): Promise<LoginAdminResponse> => {
  try {
    const res = await fetch("http://localhost:8081/api/admin/login", {
      method: "POST",
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
    console.error("Ошибка входа админа:", error);
    throw error;
  }
};

export const registerAdmin = async (
  data: {
    email: string,
    password: string
  }
): Promise<RegisterAdminResponse> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Требуется авторизация");
    }
    const res = await fetch("http://localhost:8081/api/admin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error("Ошибка регистрации админа:", error);
    throw error;
  }
};
