"""
main.py - Punto de entrada principal de la aplicación FastAPI.

Al iniciar:
  1. Se establece la conexión con PostgreSQL.
  2. Se auto-generan las tablas definidas en los modelos (create_all).
  3. Se registran los routers de cada dominio.
  4. Se configura el middleware de CORS para el frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar engine y Base ANTES de los routers para garantizar
# que los modelos estén registrados al ejecutar create_all()
from database import engine, Base

# Importar todos los modelos para que SQLAlchemy los registre en Base.metadata
import models.models  # noqa: F401

from routers import rooms
from routers import auth
from routers import faculties

# ── Auto-creación de tablas ────────────────────────────────────────────────────
# Crea todas las tablas definidas en los modelos si no existen aún.
# En producción se reemplazará por migraciones con Alembic.
Base.metadata.create_all(bind=engine)

# ── Instancia de la aplicación ─────────────────────────────────────────────────
app = FastAPI(
    title="Sistema de Reservas API",
    description="API backend para el sistema de reservas universitarias.",
    version="2.0.0",
)

# ── Configuración de CORS ──────────────────────────────────────────────────────
# Permite llamadas desde el frontend React en desarrollo local
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Registro de routers ────────────────────────────────────────────────────────
app.include_router(rooms.router)
app.include_router(auth.router)
app.include_router(faculties.router)


# ── Endpoints base ─────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health_check():
    """Endpoint de verificación del estado del servicio."""
    return {"status": "operativo"}
