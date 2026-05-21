"""
models.py - Modelos SQLAlchemy consolidados para el sistema de reservas.

Modelos:
  - Faculty:       Facultades de la universidad.
  - User:          Usuarios del sistema (estudiantes, docentes, administradores).
  - Room:          Ambientes físicos (aulas, laboratorios, salas de estudio).
  - ClassSchedule: Horarios fijos de clases asignados a un ambiente.
  - Reservation:   Reservas puntuales realizadas por usuarios.

Relaciones:
  - Faculty  1 ──< User          (una facultad tiene muchos usuarios)
  - Faculty  1 ──< Room          (una facultad tiene muchos ambientes)
  - Room     1 ──< ClassSchedule (un ambiente tiene muchos horarios fijos)
  - Room     1 ──< Reservation   (un ambiente tiene muchas reservas)
  - User     1 ──< Reservation   (un usuario tiene muchas reservas)
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
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

    # Un usuario puede tener muchas reservas puntuales.
    # cascade="all, delete-orphan": si se elimina el usuario, se eliminan sus reservas.
    reservations = relationship(
        "Reservation",
        back_populates="user",
        lazy="select",
        cascade="all, delete-orphan",
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

    # Un ambiente tiene muchos horarios fijos de clases.
    # cascade="all, delete-orphan": si se elimina el ambiente, se eliminan sus horarios.
    class_schedules = relationship(
        "ClassSchedule",
        back_populates="room",
        lazy="select",
        cascade="all, delete-orphan",
    )

    # Un ambiente tiene muchas reservas puntuales.
    # cascade="all, delete-orphan": si se elimina el ambiente, se eliminan sus reservas.
    reservations = relationship(
        "Reservation",
        back_populates="room",
        lazy="select",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Room id={self.id} name='{self.name}' "
            f"type='{self.type}' is_active={self.is_active}>"
        )


# ── Modelo: ClassSchedule ──────────────────────────────────────────────────────

class ClassSchedule(Base):
    """
    Representa un horario fijo de clase asignado a un ambiente.

    Estos horarios bloquean la disponibilidad del ambiente de forma recurrente
    cada semana en el día y rango horario especificados.

    Días de la semana disponibles:
      - 'LU': Lunes
      - 'MA': Martes
      - 'MI': Miércoles
      - 'JU': Jueves
      - 'VI': Viernes
      - 'SA': Sábado

    Los tiempos se almacenan en formato entero 24h.
    Ej: start_time=8, end_time=11 representa de 08:00 a 11:00.
    """

    __tablename__ = "class_schedules"

    id = Column(Integer, primary_key=True, index=True)

    # Ambiente al que pertenece este horario fijo
    room_id = Column(
        Integer,
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Día de la semana en formato abreviado de 2 letras
    # Valores válidos: 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'
    day_of_week = Column(String(2), nullable=False)

    # Hora de inicio en formato entero 24h (ej: 8 = 08:00, 14 = 14:00)
    start_time = Column(Integer, nullable=False)

    # Hora de fin en formato entero 24h (ej: 11 = 11:00, 17 = 17:00)
    end_time = Column(Integer, nullable=False)

    # ── Relaciones ─────────────────────────────────────────────────────────────
    room = relationship(
        "Room",
        back_populates="class_schedules",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<ClassSchedule id={self.id} room_id={self.room_id} "
            f"day='{self.day_of_week}' {self.start_time}h-{self.end_time}h>"
        )


# ── Modelo: Reservation ────────────────────────────────────────────────────────

class Reservation(Base):
    """
    Representa una reserva puntual de un ambiente realizada por un usuario.

    A diferencia de ClassSchedule (recurrente), una reserva aplica
    a una fecha específica (date) y un rango horario determinado.

    Estados disponibles:
      - 'active':    Reserva vigente y confirmada.
      - 'cancelled': Reserva cancelada por el usuario o el sistema.
      - 'completed': Reserva que ya ocurrió (uso futuro para historial).
    """

    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)

    # Ambiente reservado
    room_id = Column(
        Integer,
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Usuario que realizó la reserva
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Fecha específica de la reserva (ej: 2025-07-15)
    date = Column(Date, nullable=False, index=True)

    # Hora de inicio en formato entero 24h (ej: 8 = 08:00)
    start_time = Column(Integer, nullable=False)

    # Hora de fin en formato entero 24h (ej: 11 = 11:00)
    end_time = Column(Integer, nullable=False)

    # Estado de la reserva
    status = Column(String(20), nullable=False, default="active")

    # ── Relaciones ─────────────────────────────────────────────────────────────
    room = relationship(
        "Room",
        back_populates="reservations",
        lazy="select",
    )

    user = relationship(
        "User",
        back_populates="reservations",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Reservation id={self.id} room_id={self.room_id} "
            f"user_id={self.user_id} date={self.date} "
            f"status='{self.status}'>"
        )
