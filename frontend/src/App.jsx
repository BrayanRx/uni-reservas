import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminRooms from "./pages/AdminRooms";
import { logoutUser, getStoredToken } from "./services/api";

// ── Navbar ─────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const userEmail = sessionStorage.getItem("user_email") || "";
  const userRole = sessionStorage.getItem("user_role") || "";

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Logo / Marca */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎓</span>
        <span className="font-bold text-gray-800 text-lg">
          Reservas <span className="text-blue-600">UNI</span>
        </span>
      </div>

      {/* Links de navegación */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
            location.pathname === "/dashboard"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          🏫 Ambientes
        </button>

        {/* Solo visible para administradores */}
        {userRole === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
              location.pathname === "/admin"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⚙️ Administrar
          </button>
        )}
      </div>

      {/* Info de usuario + Cerrar sesión */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-gray-700">{userEmail}</p>
          <p className="text-xs text-gray-400 capitalize">{userRole}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-xl transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

// ── Layout con Navbar ──────────────────────────────────────────────────────────

const LayoutWithNavbar = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

// ── Ruta protegida ─────────────────────────────────────────────────────────────
// Redirige al login si no hay token activo en sessionStorage

const ProtectedRoute = ({ children }) => {
  const token = getStoredToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── App principal ──────────────────────────────────────────────────────────────

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: redirige al dashboard si hay sesión, sino al login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas con Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWithNavbar>
                <Dashboard />
              </LayoutWithNavbar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <LayoutWithNavbar>
                <AdminRooms />
              </LayoutWithNavbar>
            </ProtectedRoute>
          }
        />

        {/* Ruta 404: redirige al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
