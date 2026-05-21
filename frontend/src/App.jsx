import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminRooms from "./pages/AdminRooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir la raíz al Login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Pantallas del Sprint 1 */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminRooms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;