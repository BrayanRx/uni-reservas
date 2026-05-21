from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

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

    class Config:
        from_attributes = True


class RoomCreateRequest(BaseModel):
    """Esquema de entrada para crear un nuevo ambiente."""
    name: str
    capacity: int
    location: str
    type: str


class RoomUpdateRequest(BaseModel):
    """Esquema de entrada para editar un ambiente existente (todos los campos opcionales)."""
    name: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    type: Optional[str] = None


# ── Mock data en memoria para el MVP ──────────────────────────────────────────
# En producción se reemplazará por operaciones reales con SQLAlchemy + PostgreSQL.

MOCK_ROOMS: List[dict] = [
    {
        "id": 1,
        "name": "Aula 301",
        "capacity": 40,
        "location": "Pabellón de Ingeniería Industrial - Piso 3",
        "type": "Aula",
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Laboratorio de Cómputo LC-1",
        "capacity": 25,
        "location": "Pabellón de Sistemas - Piso 1",
        "type": "Laboratorio",
        "is_active": True,
    },
    {
        "id": 3,
        "name": "Sala de Estudios SE-02",
        "capacity": 15,
        "location": "Biblioteca FIIS - Piso 2",
        "type": "Sala de Estudios",
        "is_active": True,
    },
]

# Contador para simular auto-incremento de IDs
_next_id = 4


def _find_room(room_id: int) -> dict:
    """Busca un ambiente por ID. Lanza 404 si no existe."""
    room = next((r for r in MOCK_ROOMS if r["id"] == room_id), None)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ambiente con id={room_id} no encontrado.",
        )
    return room


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[RoomResponse])
def get_rooms():
    """
    Retorna la lista de todos los ambientes activos.
    (MVP: todos los ambientes se consideran disponibles por defecto)
    """
    return [r for r in MOCK_ROOMS if r["is_active"]]


@router.get("/all", response_model=List[RoomResponse])
def get_all_rooms():
    """
    Retorna la lista completa de ambientes (activos e inactivos).
    Usado por el panel de administración.
    """
    return MOCK_ROOMS


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(room_data: RoomCreateRequest):
    """
    Crea un nuevo ambiente en el sistema.
    """
    global _next_id
    new_room = {
        "id": _next_id,
        "name": room_data.name,
        "capacity": room_data.capacity,
        "location": room_data.location,
        "type": room_data.type,
        "is_active": True,
    }
    MOCK_ROOMS.append(new_room)
    _next_id += 1
    return new_room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, room_data: RoomUpdateRequest):
    """
    Edita los datos de un ambiente existente.
    Solo actualiza los campos enviados en el body.
    """
    room = _find_room(room_id)

    if room_data.name is not None:
        room["name"] = room_data.name
    if room_data.capacity is not None:
        room["capacity"] = room_data.capacity
    if room_data.location is not None:
        room["location"] = room_data.location
    if room_data.type is not None:
        room["type"] = room_data.type

    return room


@router.patch("/{room_id}/deactivate", response_model=RoomResponse)
def deactivate_room(room_id: int):
    """
    Realiza el borrado lógico de un ambiente (lo desactiva).
    No elimina el registro para preservar el historial de reservas.
    """
    room = _find_room(room_id)

    if not room["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El ambiente con id={room_id} ya se encuentra inactivo.",
        )

    room["is_active"] = False
    return room
