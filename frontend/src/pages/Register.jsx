import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, getFaculties } from "../services/api";

// Dominios institucionales permitidos
const ALLOWED_DOMAINS = ["@uni.edu.pe", "@uni.pe"];

const ROLES = [
  { value: "student", label: "Estudiante" },
  { value: "admin", label: "Administrador" },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    faculty_id: "",
  });

  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch de facultades al montar el componente ──────────────────────────────
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setFacultiesLoading(true);
        const data = await getFaculties();
        setFaculties(data);
        // Pre-seleccionar la primera facultad si existe
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, faculty_id: String(data[0].id) }));
        }
      } catch {
        // Si falla el fetch de facultades, el campo quedará vacío
        setFaculties([]);
      } finally {
        setFacultiesLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // ── Validación de dominio ────────────────────────────────────────────────────
  const validateDomain = (email) => {
    const lower = email.toLowerCase();
    const isValid = ALLOWED_DOMAINS.some((domain) => lower.endsWith(domain));
    if (!isValid) {
      return `Solo se permiten correos con dominio ${ALLOWED_DOMAINS.join(" o ")}`;
    }
    return null;
  };

  // ── Validación del formulario completo ───────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else {
      const domainError = validateDomain(formData.email);
      if (domainError) newErrors.email = domainError;
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!formData.role) {
      newErrors.role = "Debes seleccionar un rol.";
    }

    if (!formData.faculty_id) {
      newErrors.faculty_id = "Debes seleccionar una facultad.";
    }

    return newErrors;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        faculty_id: Number(formData.faculty_id),
      });
      // Redirigir al login con mensaje de éxito
      navigate("/login", {
        state: { successMsg: "Cuenta creada exitosamente. Inicia sesión." },
      });
    } catch (err) {
      setApiError(err.message || "Ocurrió un error al registrarse. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Advertencia de dominio en tiempo real
  const domainWarning = formData.email ? validateDomain(formData.email) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col gap-6">

        {/* Encabezado */}
        <div className="text-center">
          <p className="text-4xl mb-2">📝</p>
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">
            FIIS · Universidad Nacional de Ingeniería
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Campo: Correo Institucional */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Correo Institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu.nombre@uni.edu.pe"
              required
              className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {/* Advertencia de dominio en tiempo real */}
            {formData.email && domainWarning && !errors.email && (
              <p className="text-xs text-amber-600">⚠️ {domainWarning}</p>
            )}
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Campo: Contraseña */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.password ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Campo: Confirmar Contraseña */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Campo: Rol */}
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-semibold text-gray-700">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${
                errors.role ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Campo: Facultad */}
          <div className="flex flex-col gap-1">
            <label htmlFor="faculty_id" className="text-sm font-semibold text-gray-700">
              Facultad
            </label>
            <select
              id="faculty_id"
              name="faculty_id"
              value={formData.faculty_id}
              onChange={handleChange}
              disabled={facultiesLoading}
              className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white disabled:opacity-60 ${
                errors.faculty_id ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            >
              {facultiesLoading ? (
                <option value="">Cargando facultades...</option>
              ) : faculties.length === 0 ? (
                <option value="">No hay facultades disponibles</option>
              ) : (
                <>
                  <option value="">Selecciona tu facultad</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.faculty_id && (
              <p className="text-xs text-red-600">{errors.faculty_id}</p>
            )}
          </div>

          {/* Mensaje de error de API */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {apiError}
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading || facultiesLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200 mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        {/* Enlace a Login */}
        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
