/**
 * AdminRooms - Panel de administración para la gestión de ambientes (CRUD).
 *
 * Funcionalidades:
 *  - Listar todos los ambientes (activos e inactivos).
 *  - Crear un nuevo ambiente mediante el formulario RoomForm.
 *  - Editar un ambiente existente mediante el formulario RoomForm.
 *  - Desactivar (borrado lógico) un ambiente.
 */

import { useEffect, useState } from "react";
import RoomForm from "../components/RoomForm";
import { getAllRooms, createRoom, updateRoom, deactivateRoom } from "../services/api";

const TYPE_ICONS = {
  Aula: "🏫",
  Laboratorio: "💻",
  "Sala de Estudios": "📚",
  Auditorio: "🎭",
};

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Control del formulario: null = oculto, {} = modo crear, {id,...} = modo editar
  const [editingRoom, setEditingRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ── Carga inicial de datos ───────────────────────────────────────────────────

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de ambientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ── Helpers de feedback ──────────────────────────────────────────────────────

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ── Handlers de acciones ─────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingRoom) {
        // Modo edición
        const updated = await updateRoom(editingRoom.id, formData);
        setRooms((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        showSuccess(`✅ Ambiente "${updated.name}" actualizado correctamente.`);
      } else {
        // Modo creación
        const created = await createRoom(formData);
        setRooms((prev) => [...prev, created]);
        showSuccess(`✅ Ambiente "${created.name}" creado correctamente.`);
      }

      handleCloseForm();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el ambiente.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (room) => {
    const confirmed = window.confirm(
      `¿Estás seguro de desactivar el ambiente "${room.name}"?\n\nEsta acción no eliminará el historial de reservas asociado.`
    );
    if (!confirmed) return;

    try {
      setError(null);
      const updated = await deactivateRoom(room.id);
      setRooms((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      showSuccess(`⚠️ Ambiente "${updated.name}" desactivado correctamente.`);
    } catch (err) {
      setError(err.message || "No se pudo desactivar el ambiente.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Ambientes
          </h1>
          <p className="text-gray-500 mt-1">
            Panel de Administración · FIIS - UNI
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition-colors duration-200 flex items-center gap-2"
        >
          <span>➕</span> Nuevo Ambiente
        </button>
      </div>

      {/* Formulario modal (overlay) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <RoomForm
            initialData={editingRoom}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            loading={formLoading}
          />
        </div>
      )}

      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
          {successMsg}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Estado: Cargando */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-400 text-lg animate-pulse">
            Cargando ambientes...
          </p>
        </div>
      )}

      {/* Tabla de ambientes */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">
                  Ambiente
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">
                  Tipo
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">
                  Capacidad
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">
                  Ubicación
                </th>
                <th className="text-center px-6 py-4 font-semibold text-gray-600">
                  Estado
                </th>
                <th className="text-center px-6 py-4 font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-400 py-12"
                  >
                    No hay ambientes registrados.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className={`transition-colors ${
                      room.is_active ? "hover:bg-gray-50" : "bg-gray-50 opacity-60"
                    }`}
                  >
                    {/* Nombre */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <span className="mr-2">
                        {TYPE_ICONS[room.type] || "🏢"}
                      </span>
                      {room.name}
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 text-gray-600">{room.type}</td>

                    {/* Capacidad */}
                    <td className="px-6 py-4 text-gray-600">
                      👥 {room.capacity} personas
                    </td>

                    {/* Ubicación */}
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {room.location}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      {room.is_active ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          disabled={!room.is_active}
                          className="bg-amber-100 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed text-amber-700 font-semibold text-xs py-1.5 px-3 rounded-lg transition-colors duration-200"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeactivate(room)}
                          disabled={!room.is_active}
                          className="bg-red-100 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 font-semibold text-xs py-1.5 px-3 rounded-lg transition-colors duration-200"
                        >
                          🚫 Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer de la tabla */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Total: {rooms.length} ambiente(s) ·{" "}
            {rooms.filter((r) => r.is_active).length} activo(s) ·{" "}
            {rooms.filter((r) => !r.is_active).length} inactivo(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
