/**
 * RoomForm - Formulario reutilizable para crear y editar ambientes.
 *
 * Props:
 *  - initialData (object|null): Datos del ambiente a editar. Si es null, el formulario
 *    opera en modo "Crear".
 *  - onSubmit (function): Callback que recibe los datos del formulario al hacer submit.
 *  - onCancel (function): Callback para cancelar y cerrar el formulario.
 *  - loading (boolean): Indica si hay una operación en curso para deshabilitar el botón.
 */

import { useState, useEffect } from "react";

const ROOM_TYPES = ["Aula", "Laboratorio", "Sala de Estudios", "Auditorio"];

const EMPTY_FORM = {
  name: "",
  capacity: "",
  location: "",
  type: ROOM_TYPES[0],
};

const RoomForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEditMode = initialData !== null;

  // Cargar datos iniciales cuando se edita un ambiente
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        capacity: initialData.capacity || "",
        location: initialData.location || "",
        type: initialData.type || ROOM_TYPES[0],
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!formData.capacity || isNaN(formData.capacity) || Number(formData.capacity) <= 0) {
      newErrors.capacity = "La capacidad debe ser un número mayor a 0.";
    }
    if (!formData.location.trim()) {
      newErrors.location = "La ubicación es obligatoria.";
    }
    if (!formData.type) {
      newErrors.type = "El tipo de ambiente es obligatorio.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      name: formData.name.trim(),
      capacity: Number(formData.capacity),
      location: formData.location.trim(),
      type: formData.type,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
      {/* Encabezado del formulario */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {isEditMode ? "✏️ Editar Ambiente" : "➕ Nuevo Ambiente"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Campo: Nombre */}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700">
            Nombre del Ambiente
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Aula 301"
            className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Campo: Capacidad */}
        <div className="flex flex-col gap-1">
          <label htmlFor="capacity" className="text-sm font-semibold text-gray-700">
            Capacidad (personas)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Ej: 40"
            className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.capacity ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.capacity && (
            <p className="text-xs text-red-600">{errors.capacity}</p>
          )}
        </div>

        {/* Campo: Tipo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-sm font-semibold text-gray-700">
            Tipo de Ambiente
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${
              errors.type ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Campo: Ubicación */}
        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-sm font-semibold text-gray-700">
            Ubicación
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Pabellón de Sistemas - Piso 1"
            className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.location ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.location && (
            <p className="text-xs text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
          >
            {loading
              ? "Guardando..."
              : isEditMode
              ? "Guardar Cambios"
              : "Crear Ambiente"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
