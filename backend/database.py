"""
database.py - Configuración central de la conexión a PostgreSQL con SQLAlchemy.

Provee:
  - engine: Motor de conexión a la base de datos.
  - SessionLocal: Fábrica de sesiones para operaciones ORM.
  - Base: Clase base declarativa para todos los modelos.
  - get_db(): Dependencia de FastAPI para inyectar la sesión en los endpoints.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno desde .env (útil en desarrollo local sin Docker)
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@db:5432/reservas_db",  # Valor por defecto para Docker
)

# ── Motor de base de datos ─────────────────────────────────────────────────────
# pool_pre_ping=True: Verifica la conexión antes de usarla (evita errores por conexiones caídas)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# ── Fábrica de sesiones ────────────────────────────────────────────────────────
# autocommit=False: Los cambios deben confirmarse explícitamente con session.commit()
# autoflush=False: No sincroniza automáticamente antes de cada query
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ── Base declarativa ───────────────────────────────────────────────────────────
# Todos los modelos SQLAlchemy deben heredar de esta clase
Base = declarative_base()


# ── Dependencia de FastAPI ─────────────────────────────────────────────────────

def get_db():
    """
    Dependencia que provee una sesión de base de datos por request.
    Garantiza que la sesión se cierre correctamente al finalizar cada request,
    incluso si ocurre una excepción.

    Uso en endpoints:
        def my_endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
