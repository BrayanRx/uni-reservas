import { useState } from "react";
import { loginUser } from "../services/api";

const ALLOWED_DOMAIN = "@uni.edu.pe";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validación de dominio en el cliente antes de enviar al servidor
  const validateDomain = (value) => {
    if (value && !value.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      return `Solo se permiten correos con dominio ${ALLOWED_DOMAIN}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validación de dominio en el cliente
    const domainError = validateDomain(email);
    if (domainError) {
      setError(domainError);
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email, password);
      setSuccessMsg(data.message);
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const domainWarning = validateDomain(email);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col gap-6">

        {/* Logo / Encabezado */}
        <div className="text-center">
          <p className="text-4xl mb-2">🎓</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Reservas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            FIIS · Universidad Nacional de Ingeniería
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Campo Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Correo Institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="tu.nombre@uni.edu.pe"
              required
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {/* Advertencia de dominio en tiempo real */}
            {email && domainWarning && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ {domainWarning}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Mensaje de Éxito */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              ✅ {successMsg}
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200 mt-2"
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Solo para estudiantes y docentes con correo{" "}
          <span className="font-semibold text-gray-500">@uni.edu.pe</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
