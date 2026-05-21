"""
models.py - Modelos SQLAlchemy consolidados para el sistema de reservas.

Modelos:
  - Faculty: Facultades de la universidad.
  - User:    Usuarios del sistema (estudiantes, docentes, administradores).
  - Room:    Ambientes físicos (aulas, laboratorios, salas de estudio).

Relaciones:
  - Faculty  1 ──< User   (una facultad tiene muchos usuarios)
  - Faculty  1 ──< Room   (una facultad tiene muchos ambientes)
  - User     >── Faculty  (un usuario pertenece a una facultad)
  - Room     >── Faculty  (un ambiente pertenece a una facultad)
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from database import Base


# ── Modelo: Faculty ────────────────────────────────────────────────────────────

class Faculty(Base):
    """
    Representa una facultad de la universidad.
    Ej: FIIS, FIC, FIQT, etc.
    """

    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # ── Relaciones ─────────────────────────────────────────────────────────────
    # back_populates: nombre del atributo en el modelo relacionado
    # lazy="select": carga los relacionados solo cuando se accede al atributo
    users = relationship(
        "User",
        back_populates="faculty",
        lazy="select",
    )
    rooms = relationship(
        "Room",
        back_populates="faculty",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Faculty id={self.id} name='{self.name}' is_active={self.is_active}>"


# ── Modelo: User ───────────────────────────────────────────────────────────────

class User(Base):
    """
    Representa un usuario del sistema.

    Roles disponibles:
      - 'student':  Estudiante (puede explorar y reservar ambientes).
      - 'teacher':  Docente (puede reservar ambientes con mayor prioridad).
      - 'admin':    Administrador (gestión completa del sistema).
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Rol del usuario dentro del sistema
    role = Column(String(20), nullable=False, default="student")

    # Clave foránea hacia Faculty (nullable: un usuario puede no tener facultad asignada)
    faculty_id = Column(
        Integer,
        ForeignKey("faculties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── Relaciones ─────────────────────────────────────────────────────────────
    faculty = relationship(
        "Faculty",
        back_populates="users",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<User id={self.id} email='{self.email}' "
            f"role='{self.role}' is_active={self.is_active}>"
        )


# ── Modelo: Room ───────────────────────────────────────────────────────────────

class Room(Base):
    """
    Representa un ambiente físico de la universidad.

    Tipos disponibles:
      - 'Aula'
      - 'Laboratorio'
      - 'Sala de Estudios'
      - 'Auditorio'
    """

    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Clave foránea hacia Faculty (nullable: un ambiente puede no tener facultad asignada)
    faculty_id = Column(
        Integer,
        ForeignKey("faculties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── Relaciones ─────────────────────────────────────────────────────────────
    faculty = relationship(
        "Faculty",
        back_populates="rooms",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Room id={self.id} name='{self.name}' "
            f"type='{self.type}' is_active={self.is_active}>"
        )
