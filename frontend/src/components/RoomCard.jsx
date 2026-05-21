/**
 * RoomCard - Componente de tarjeta para mostrar la información de un ambiente.
 * Props:
 *  - name (string): Nombre del ambiente.
 *  - capacity (number): Capacidad máxima de personas.
 *  - location (string): Ubicación física dentro del campus.
 *  - type (string): Tipo de ambiente (Aula, Laboratorio, etc.).
 */

const TYPE_ICONS = {
  Aula: "🏫",
  Laboratorio: "💻",
  "Sala de Estudios": "📚",
};

const RoomCard = ({ name, capacity, location, type }) => {
  const icon = TYPE_ICONS[type] || "🏢";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col gap-4 border border-gray-100">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Disponible
        </span>
      </div>

      {/* Nombre del ambiente */}
      <h2 className="text-xl font-bold text-gray-800">{name}</h2>

      {/* Detalles */}
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>Capacidad: {capacity} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🏷️</span>
          <span>{type}</span>
        </div>
      </div>

      {/* Botón de acción */}
      <button className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200">
        Reservar
      </button>
    </div>
  );
};

export default RoomCard;
