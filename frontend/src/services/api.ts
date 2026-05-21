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
  role: string;
  faculty_id: number | null;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  faculty_id: number;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: string;
  faculty_id: number | null;
  message: string;
}

export interface ApiError {
  detail: string;
}

export interface Faculty {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  type: string;
  is_active: boolean;
  faculty_id?: number | null;
}

export interface RoomCreateRequest {
  name: string;
  capacity: number;
  location: string;
  type: string;
  faculty_id?: number | null;
}

export interface RoomUpdateRequest {
  name?: string;
  capacity?: number;
  location?: string;
  type?: string;
  faculty_id?: number | null;
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
 * Almacena token, email, role y faculty_id en sessionStorage.
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

  // Persistir datos de sesión en sessionStorage
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("user_email", data.email);
  sessionStorage.setItem("user_role", data.role);
  if (data.faculty_id !== null && data.faculty_id !== undefined) {
    sessionStorage.setItem("user_faculty_id", String(data.faculty_id));
  }

  return data;
};

/**
 * registerUser - Registra un nuevo usuario en el sistema.
 */
export const registerUser = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse<RegisterResponse>(response);
};

/**
 * logoutUser - Limpia todos los datos de sesión del sessionStorage.
 */
export const logoutUser = (): void => {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user_email");
  sessionStorage.removeItem("user_role");
  sessionStorage.removeItem("user_faculty_id");
};

/**
 * getStoredToken - Recupera el token almacenado en sessionStorage.
 * @returns El token JWT o null si no existe sesión activa.
 */
export const getStoredToken = (): string | null => {
  return sessionStorage.getItem("access_token");
};

// ── Faculties ──────────────────────────────────────────────────────────────────

/**
 * getFaculties - Obtiene la lista de facultades activas.
 */
export const getFaculties = async (): Promise<Faculty[]> => {
  const response = await fetch(`${BASE_URL}/api/faculties/`);
  return handleResponse<Faculty[]>(response);
};

// ── Rooms ──────────────────────────────────────────────────────────────────────

/**
 * getRooms - Obtiene la lista de ambientes activos.
 * @param facultyId - Opcional: filtra por facultad
 */
export const getRooms = async (facultyId?: number): Promise<Room[]> => {
  const url = facultyId
    ? `${BASE_URL}/api/rooms/?faculty_id=${facultyId}`
    : `${BASE_URL}/api/rooms/`;
  const response = await fetch(url);
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
