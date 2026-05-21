import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";

const BASE_URL = "http://localhost:8000";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);

        // Recuperar faculty_id del usuario logueado desde sessionStorage
        const facultyId = sessionStorage.getItem("user_faculty_id");

        // Construir URL con filtro de facultad si está disponible
        const url = facultyId
          ? `${BASE_URL}/api/rooms/?faculty_id=${facultyId}`
          : `${BASE_URL}/api/rooms/`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        setError(err.message || "No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Explorador de Ambientes
        </h1>
        <p className="text-gray-500 mt-1">
          FIIS - UNI · Ambientes disponibles ahora
        </p>
      </div>

      {/* Estado: Cargando */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-400 text-lg animate-pulse">
            Cargando ambientes...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <p className="font-semibold">⚠️ Error al cargar los datos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Estado: Sin resultados */}
      {!loading && !error && rooms.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-5xl mb-4">🏫</p>
          <p className="text-lg">No hay ambientes disponibles en este momento.</p>
        </div>
      )}

      {/* Grid de tarjetas */}
      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              name={room.name}
              capacity={room.capacity}
              location={room.location}
              type={room.type}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
