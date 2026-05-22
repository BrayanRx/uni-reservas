# Sistema de Reservas UNI - FIIS 🎓

Plataforma integral para la gestión y reserva de ambientes de estudio (aulas, laboratorios, salas) en la Universidad Nacional de Ingeniería.

## 🏗 Arquitectura del Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** FastAPI + SQLAlchemy + Pydantic
- **Base de Datos:** PostgreSQL
- **Orquestación:** Docker Compose

---

## 🚀 1. Clonación e Inicialización del Proyecto

### 1.1. Requisitos Previos
Asegúrate de tener instalados:
- [Git](https://git-scm.com/)
- [Docker y Docker Compose](https://www.docker.com/products/docker-desktop/)
- [Python 3.11+](https://www.python.org/)

### 1.2. Levantar la Infraestructura (Docker)
El proyecto está completamente contenerizado. Para inicializar los servicios:

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd uni-reservas
   ```

2. Configura las variables de entorno:
   Copia el archivo de ejemplo y renómbralo a `.env`.
   ```bash
   cp .env.example .env
   ```


   *(El archivo `.env` por defecto ya contiene las credenciales locales para PostgreSQL).*
3. Construye y levanta los contenedores:
   ```bash
   docker compose up --build -d
   
   ```



### 1.3. Accesos Locales

Una vez que los contenedores estén corriendo, los servicios estarán disponibles en:

* **Frontend (Aplicación Web):** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Backend (Swagger UI API Docs):** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)
* **Base de Datos (PostgreSQL):** `localhost:5432`

---

## 🐍 2. Configuración del Entorno Virtual (Local)

Aunque el código se ejecuta dentro de Docker, **es obligatorio** configurar un entorno virtual local de Python. Esto permite que el IDE (VS Code/Cursor) y las herramientas de IA (como Aider) puedan resolver las importaciones, habilitar el autocompletado y analizar el código estático correctamente.

1. Abre una terminal en la raíz del proyecto.
2. Crea el entorno virtual:
```bash
python -m venv venv

```


3. Activa el entorno virtual:
* **Windows:** `.\venv\Scripts\activate`
* **Mac/Linux:** `source venv/bin/activate`


4. Instala las dependencias del backend en tu máquina local:
```bash
cd backend
pip install -r requirements.txt
cd ..

```



---

## 🤖 3. Flujo de Trabajo con Aider (IA Coding Assistant)

Utilizamos **Aider** acoplado a Claude 3.5 Sonnet (o modelos similares) para acelerar el desarrollo. Aider edita los archivos directamente en el repositorio.

### Instalación de Aider

Asegúrate de tener el entorno virtual activado (`venv`) e instala la herramienta:

```bash
pip install aider-chat
```

*(Es necesario tener configurada tu API Key, por ejemplo: `export ANTHROPIC_API_KEY=tu-llave` o configurada en tu sistema).*

### Reglas de Uso

Para evitar romper la arquitectura o generar *Scope Creep* (expansión descontrolada de requerimientos), sigue este protocolo al interactuar con Aider:

1. **Aislamiento de Tareas:** Lanza prompts específicos de una sola historia de usuario a la vez. No pidas refactorizaciones masivas en un solo prompt.
2. **Uso de Archivos:** Usa el comando `/add` dentro de Aider para incluir **solo** los archivos relevantes a la tarea actual.
   ```text
   > /add backend/routers/rooms.py backend/models/models.py
   ```


3. **Validación:** Revisa los *commits* automáticos que genera Aider. Si la IA rompe algo, utiliza el comando `/undo` inmediatamente para revertir el último cambio.
4. **Ejecución desde la raíz:** Ejecuta Aider siempre desde la raíz del monorepositorio para que mantenga el contexto de las rutas `backend/` y `frontend/`.

---

## 🛠 4. Comandos Frecuentes de Operación

**Detener los servicios sin borrar datos:**

   ```bash
   docker compose stop
   ```

**Destruir los contenedores (Las tablas de la BD se mantendrán por el volumen):**

   ```bash
   docker compose down
   ```

**Ver los logs en tiempo real (ej. del backend):**

   ```bash
   docker compose logs -f backend
   
   ```

**Reconstruir forzosamente un servicio tras instalar nuevas dependencias:**

   ```bash
   docker compose up --build -d backend
   ```
