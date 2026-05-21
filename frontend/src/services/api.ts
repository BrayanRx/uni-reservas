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

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  type: string;
  is_active: boolean;
}

export interface RoomCreateRequest {
  name: string;
  capacity: number;
  location: string;
  type: string;
}

export interface RoomUpdateRequest {
  name?: string;
  capacity?: number;
  location?: string;
  type?: string;
}

// ── Helper interno ─────────────────────────────────────────────────────────────

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(
      errorData.detail || `Error del servidor: ${response.status}`
    );
  }
  return response.json() as Promise<T>;
};

// ── Auth ───────────────────────────────────────────────────────────────────────

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

  const data = await handleResponse<LoginResponse>(response);

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

// ── Rooms ──────────────────────────────────────────────────────────────────────

/**
 * getRooms - Obtiene la lista de ambientes activos.
 */
export const getRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${BASE_URL}/api/rooms/`);
  return handleResponse<Room[]>(response);
};

/**
 * getAllRooms - Obtiene todos los ambientes (activos e inactivos).
 * Usado por el panel de administración.
 */
export const getAllRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${BASE_URL}/api/rooms/all`);
  return handleResponse<Room[]>(response);
};

/**
 * createRoom - Crea un nuevo ambiente en el sistema.
 * @param roomData - Datos del nuevo ambiente
 * @returns El ambiente creado
 */
export const createRoom = async (roomData: RoomCreateRequest): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/api/rooms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });
  return handleResponse<Room>(response);
};

/**
 * updateRoom - Edita los datos de un ambiente existente.
 * @param id - ID del ambiente a editar
 * @param roomData - Campos a actualizar (parcial)
 * @returns El ambiente actualizado
 */
export const updateRoom = async (
  id: number,
  roomData: RoomUpdateRequest
): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });
  return handleResponse<Room>(response);
};

/**
 * deactivateRoom - Realiza el borrado lógico de un ambiente.
 * @param id - ID del ambiente a desactivar
 * @returns El ambiente con is_active = false
 */
export const deactivateRoom = async (id: number): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/api/rooms/${id}/deactivate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Room>(response);
};
