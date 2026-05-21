from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/rooms",
    tags=["Rooms"],
)


# Schema de respuesta con Pydantic
class RoomResponse(BaseModel):
    id: int
    name: str
    capacity: int
    location: str
    type: str

    class Config:
        from_attributes = True


# Mock data: 3 ambientes reales de la FIIS - UNMSM
MOCK_ROOMS: List[RoomResponse] = [
    RoomResponse(
        id=1,
        name="Aula 301",
        capacity=40,
        location="Pabellón de Ingeniería Industrial - Piso 3",
        type="Aula",
    ),
    RoomResponse(
        id=2,
        name="Laboratorio de Cómputo LC-1",
        capacity=25,
        location="Pabellón de Sistemas - Piso 1",
        type="Laboratorio",
    ),
    RoomResponse(
        id=3,
        name="Sala de Estudios SE-02",
        capacity=15,
        location="Biblioteca FIIS - Piso 2",
        type="Sala de Estudios",
    ),
]


@router.get("/", response_model=List[RoomResponse])
def get_rooms():
    """
    Retorna la lista de todos los ambientes disponibles.
    (MVP: todos los ambientes se consideran disponibles por defecto)
    """
    return MOCK_ROOMS
