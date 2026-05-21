from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sistema de Reservas API",
    description="API backend para el sistema de reservas.",
    version="1.0.0",
)

# Configuración de CORS para permitir llamadas desde el frontend en desarrollo
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


@app.get("/api/health", tags=["Health"])
def health_check():
    """Endpoint de verificación del estado del servicio."""
    return {"status": "operativo"}
