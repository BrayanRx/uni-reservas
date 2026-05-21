from fastapi import APIRouter, HTTPException, status
from models.user import UserLoginRequest, UserLoginResponse, ALLOWED_DOMAIN

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)

# ── Mock de usuarios válidos para el MVP ───────────────────────────────────────
# En producción esto se reemplazará por consultas reales a la base de datos.
MOCK_USERS = {
    "estudiante@uni.edu.pe": "password123",
    "alumno.sistemas@uni.edu.pe": "uni2024",
}

# ── Token JWT dummy para el MVP ────────────────────────────────────────────────
# En producción se generará con python-jose y una SECRET_KEY segura.
DUMMY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bXZwLXRva2VuLWZpbWlz.dummy_signature_mvp"


@router.post(
    "/login",
    response_model=UserLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(credentials: UserLoginRequest):
    """
    Endpoint de autenticación institucional.

    - Valida que el email tenga dominio @uni.edu.pe.
    - Verifica las credenciales contra el mock de usuarios.
    - Retorna un token JWT dummy para el MVP.
    """

    # La validación del dominio ya ocurre en el Pydantic validator.
    # Si llega aquí, el dominio es correcto.

    # Verificar si el usuario existe en el mock
    stored_password = MOCK_USERS.get(credentials.email)

    if stored_password is None or stored_password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifica tu email y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserLoginResponse(
        access_token=DUMMY_TOKEN,
        token_type="bearer",
        email=credentials.email,
        message="Inicio de sesión exitoso. Bienvenido al sistema de reservas FIIS.",
    )
