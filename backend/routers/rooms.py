"""
routers/rooms.py - Endpoints para la gestión de ambientes (Rooms).

Endpoints:
  GET    /api/rooms/         - Lista ambientes activos (Dashboard público).
  GET    /api/rooms/all      - Lista todos los ambientes (Panel admin).
  POST   /api/rooms/         - Crea un nuevo ambiente.
  PUT    /api/rooms/{id}     - Edita un ambiente existente.
  PATCH  /api/rooms/{id}/deactivate - Borrado lógico de un ambiente.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.models import Room, Faculty

router = APIRouter(
    prefix="/api/rooms",
    tags=["Rooms"],
)


# ── Schemas Pydantic ───────────────────────────────────────────────────────────

class RoomResponse(BaseModel):
    id: int
    name: str
    capacity: int
    location: str
    type: str
    is_active: bool
    faculty_id: Optional[int] = None

    class Config:
        from_attributes = True


class RoomCreateRequest(BaseModel):
    """Esquema de entrada para crear un nuevo ambiente."""
    name: str
    capacity: int
    location: str
    type: str
    faculty_id: Optional[int] = None


class RoomUpdateRequest(BaseModel):
    """Esquema de entrada para editar un ambiente existente (todos los campos opcionales)."""
    name: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    type: Optional[str] = None
    faculty_id: Optional[int] = None


# ── Helper interno ─────────────────────────────────────────────────────────────

def _get_room_or_404(room_id: int, db: Session) -> Room:
    """Busca un ambiente por ID. Lanza 404 si no existe."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ambiente con id={room_id} no encontrado.",
        )
    return room


def _validate_faculty(faculty_id: int, db: Session) -> None:
    """Valida que la facultad exista y esté activa. Lanza 404 si no."""
    faculty = db.query(Faculty).filter(
        Faculty.id == faculty_id,
        Faculty.is_active == True,  # noqa: E712
    ).first()
    if faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facultad con id={faculty_id} no encontrada o inactiva.",
        )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    """
    Retorna la lista de todos los ambientes activos.
    Usado por el Dashboard público de estudiantes.
    """
    rooms = db.query(Room).filter(Room.is_active == True).all()  # noqa: E712
    return rooms


@router.get("/all", response_model=List[RoomResponse])
def get_all_rooms(db: Session = Depends(get_db)):
    """
    Retorna la lista completa de ambientes (activos e inactivos).
    Usado por el panel de administración.
    """
    rooms = db.query(Room).all()
    return rooms


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(room_data: RoomCreateRequest, db: Session = Depends(get_db)):
    """
    Crea un nuevo ambiente en el sistema.
    Valida que la facultad exista si se proporciona faculty_id.
    """
    if room_data.faculty_id is not None:
        _validate_faculty(room_data.faculty_id, db)

    new_room = Room(
        name=room_data.name,
        capacity=room_data.capacity,
        location=room_data.location,
        type=room_data.type,
        faculty_id=room_data.faculty_id,
        is_active=True,
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_data: RoomUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Edita los datos de un ambiente existente.
    Solo actualiza los campos enviados en el body.
    """
    room = _get_room_or_404(room_id, db)

    if room_data.faculty_id is not None:
        _validate_faculty(room_data.faculty_id, db)

    if room_data.name is not None:
        room.name = room_data.name
    if room_data.capacity is not None:
        room.capacity = room_data.capacity
    if room_data.location is not None:
        room.location = room_data.location
    if room_data.type is not None:
        room.type = room_data.type
    if room_data.faculty_id is not None:
        room.faculty_id = room_data.faculty_id

    db.commit()
    db.refresh(room)
    return room


@router.patch("/{room_id}/deactivate", response_model=RoomResponse)
def deactivate_room(room_id: int, db: Session = Depends(get_db)):
    """
    Realiza el borrado lógico de un ambiente (lo desactiva).
    No elimina el registro para preservar el historial de reservas.
    """
    room = _get_room_or_404(room_id, db)

    if not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El ambiente con id={room_id} ya se encuentra inactivo.",
        )

    room.is_active = False
    db.commit()
    db.refresh(room)
    return room
