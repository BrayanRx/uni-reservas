from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Room(Base):
    """Modelo SQLAlchemy que representa un ambiente físico (aula o laboratorio)."""

    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # Ej: "Aula", "Laboratorio"
