"""
routers/auth.py - Endpoints de autenticación institucional.

Endpoints:
  POST /api/auth/login    - Autenticación con correo institucional.
  POST /api/auth/register - Registro de nuevo usuario institucional.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from typing import Optional

from database import get_db
from models.models import User, Faculty

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)

# Dominios institucionales permitidos
ALLOWED_DOMAINS = ["@uni.pe"]

# ── Token JWT dummy para el MVP ────────────────────────────────────────────────
# En producción se generará con python-jose y una SECRET_KEY segura desde .env
DUMMY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bXZwLXRva2VuLWZpbWlz.dummy_signature_mvp"


# ── Helper de validación de dominio ───────────────────────────────────────────

def _validate_institutional_domain(email: str) -> str:
    """
    Valida que el correo pertenezca a uno de los dominios institucionales permitidos.
    Retorna el email en minúsculas si es válido, lanza ValueError si no.
    """
    lower = email.lower()
    if not any(lower.endswith(domain) for domain in ALLOWED_DOMAINS):
        raise ValueError(
            f"Solo se permiten correos institucionales con dominio "
            f"{' o '.join(ALLOWED_DOMAINS)}"
        )
    return lower


# ── Schemas Pydantic ───────────────────────────────────────────────────────────

class UserLoginRequest(BaseModel):
    """Esquema de entrada para el login."""

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_uni_domain(cls, value: str) -> str:
        """Valida que el correo pertenezca a un dominio institucional permitido."""
        return _validate_institutional_domain(value)


class UserLoginResponse(BaseModel):
    """Esquema de salida tras un login exitoso."""

    access_token: str
    token_type: str
    email: str
    role: str
    faculty_id: Optional[int] = None
    message: str

    class Config:
        from_attributes = True


class UserRegisterRequest(BaseModel):
    """Esquema de entrada para el registro de un nuevo usuario."""

    email: str
    password: str
    role: str = "student"
    faculty_id: int

    @field_validator("email")
    @classmethod
    def validate_uni_domain(cls, value: str) -> str:
        """Valida que el correo pertenezca a un dominio institucional permitido."""
        return _validate_institutional_domain(value)

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        """Valida que el rol sea uno de los permitidos."""
        allowed_roles = ["student", "teacher", "admin"]
        if value not in allowed_roles:
            raise ValueError(
                f"Rol inválido. Los roles permitidos son: {', '.join(allowed_roles)}"
            )
        return value

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        """Valida que la contraseña tenga al menos 6 caracteres."""
        if len(value) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        return value


class UserRegisterResponse(BaseModel):
    """Esquema de salida tras un registro exitoso."""

    id: int
    email: str
    role: str
    faculty_id: Optional[int] = None
    message: str

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=UserLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de autenticación institucional.

    - Valida que el email tenga dominio institucional (validado por Pydantic).
    - Busca el usuario en PostgreSQL.
    - Verifica la contraseña (en MVP se compara en texto plano;
      en producción se usará passlib para comparar hashes bcrypt).
    - Retorna un token JWT dummy para el MVP.
    """
    # Buscar usuario activo en la base de datos
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
        faculty_id=user.faculty_id,
        message=f"Inicio de sesión exitoso. Bienvenido al sistema de reservas, {user.email}.",
    )


@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Endpoint de registro de nuevos usuarios institucionales.

    - Valida que el email tenga dominio institucional (validado por Pydantic).
    - Verifica que el email no esté ya registrado en la BD.
    - Verifica que la facultad exista y esté activa.
    - Inserta el nuevo usuario con su role y faculty_id.
    """
    # Verificar que el email no esté ya registrado
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El correo '{user_data.email}' ya está registrado en el sistema.",
        )

    # Verificar que la facultad exista y esté activa
    faculty = db.query(Faculty).filter(
        Faculty.id == user_data.faculty_id,
        Faculty.is_active == True,  # noqa: E712
    ).first()

    if faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facultad con id={user_data.faculty_id} no encontrada o inactiva.",
        )

    # Crear el nuevo usuario
    # MVP: la contraseña se almacena en texto plano en password_hash.
    # TODO: Reemplazar por passlib.hash.bcrypt() cuando se implemente el hash.
    new_user = User(
        email=user_data.email,
        password_hash=user_data.password,
        role=user_data.role,
        faculty_id=user_data.faculty_id,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserRegisterResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        faculty_id=new_user.faculty_id,
        message=f"Cuenta creada exitosamente. Ya puedes iniciar sesión con {new_user.email}.",
    )
