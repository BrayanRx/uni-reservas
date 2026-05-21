"""
routers/auth.py - Endpoints de autenticación institucional.

Endpoints:
  POST /api/auth/login - Autenticación con correo @uni.edu.pe.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator

from database import get_db
from models.models import User

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)

ALLOWED_DOMAIN = "@uni.edu.pe"


# ── Schemas Pydantic ───────────────────────────────────────────────────────────

class UserLoginRequest(BaseModel):
    """Esquema de entrada para el login."""

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_uni_domain(cls, value: str) -> str:
        """Valida que el correo pertenezca estrictamente al dominio @uni.edu.pe."""
        if not value.lower().endswith(ALLOWED_DOMAIN):
            raise ValueError(
                f"Solo se permiten correos institucionales con dominio {ALLOWED_DOMAIN}"
            )
        return value.lower()


class UserLoginResponse(BaseModel):
    """Esquema de salida tras un login exitoso."""

    access_token: str
    token_type: str
    email: str
    role: str
    message: str

    class Config:
        from_attributes = True


# ── Token JWT dummy para el MVP ────────────────────────────────────────────────
# En producción se generará con python-jose y una SECRET_KEY segura desde .env
DUMMY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bXZwLXRva2VuLWZpbWlz.dummy_signature_mvp"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=UserLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de autenticación institucional.

    - Valida que el email tenga dominio @uni.edu.pe (validado por Pydantic).
    - Busca el usuario en PostgreSQL.
    - Verifica la contraseña (en MVP se compara en texto plano;
      en producción se usará passlib para comparar hashes bcrypt).
    - Retorna un token JWT dummy para el MVP.
    """
    # Buscar usuario en la base de datos
    user = db.query(User).filter(
        User.email == credentials.email,
        User.is_active == True,  # noqa: E712
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifica tu email y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # MVP: comparación directa de contraseña en texto plano.
    # TODO: Reemplazar por passlib.context.verify() cuando se implemente el hash.
    if user.password_hash != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifica tu email y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserLoginResponse(
        access_token=DUMMY_TOKEN,
        token_type="bearer",
        email=user.email,
        role=user.role,
        message=f"Inicio de sesión exitoso. Bienvenido al sistema de reservas, {user.email}.",
    )
