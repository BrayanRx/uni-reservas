"""
routers/faculties.py - Endpoints para la consulta de facultades.

Endpoints:
  GET /api/faculties/ - Lista todas las facultades activas.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models.models import Faculty

router = APIRouter(
    prefix="/api/faculties",
    tags=["Faculties"],
)


# ── Schemas Pydantic ───────────────────────────────────────────────────────────

class FacultyResponse(BaseModel):
    """Esquema de salida para una facultad."""

    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[FacultyResponse],
    status_code=status.HTTP_200_OK,
)
def get_faculties(db: Session = Depends(get_db)):
    """
    Retorna la lista de todas las facultades activas.
    Usado por el formulario de registro para llenar el dropdown de facultades.
    """
    faculties = db.query(Faculty).filter(
        Faculty.is_active == True  # noqa: E712
    ).order_by(Faculty.name).all()
    return faculties
