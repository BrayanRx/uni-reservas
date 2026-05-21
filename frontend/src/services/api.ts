/**
 * api.ts - Servicio centralizado para las llamadas al backend.
 */

const BASE_URL = "http://localhost:8000";

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  email: string;
  message: string;
}

export interface ApiError {
  detail: string;
}

// ── Funciones de API ───────────────────────────────────────────────────────────

/**
 * loginUser - Envía las credenciales al endpoint de autenticación.
 * @param email - Correo institucional (@uni.edu.pe)
 * @param password - Contraseña del usuario
 * @returns LoginResponse con el token de sesión
 * @throws Error con el mensaje del servidor si las credenciales son inválidas
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password } as LoginRequest),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(
      errorData.detail || `Error del servidor: ${response.status}`
    );
  }

  const data: LoginResponse = await response.json();

  // Almacenar el token en sessionStorage para la sesión actual
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("user_email", data.email);

  return data;
};

/**
 * logoutUser - Limpia la sesión del usuario del almacenamiento local.
 */
export const logoutUser = (): void => {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user_email");
};

/**
 * getStoredToken - Recupera el token almacenado en sessionStorage.
 * @returns El token JWT o null si no existe sesión activa.
 */
export const getStoredToken = (): string | null => {
  return sessionStorage.getItem("access_token");
};
