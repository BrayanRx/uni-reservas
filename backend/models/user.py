from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel, EmailStr, field_validator

Base = declarative_base()

ALLOWED_DOMAIN = "@uni.edu.pe"


# ── Modelo SQLAlchemy ──────────────────────────────────────────────────────────

class User(Base):
    """Modelo SQLAlchemy que representa un usuario del sistema."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


# ── Esquemas Pydantic ──────────────────────────────────────────────────────────

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
    message: str

    class Config:
        from_attributes = True
