import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
          isActive
            ? "bg-blue-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span className="text-xl">{icon}</span>
        {isSidebarOpen && <span className="font-medium">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold tracking-wider text-blue-400">
              ADMIN PANEL
            </h1>
          ) : (
            <h1 className="text-xl font-bold text-blue-400 mx-auto">AP</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <NavItem to="/admin" icon="📊" label="Dashboard" />
          <NavItem to="/admin/ngos" icon="🏢" label="Manage NGOs" />
          <NavItem to="/admin/reporters" icon="👥" label="Reporters" />
          <NavItem to="/admin/reports" icon="🚨" label="All Reports" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors`}
          >
            <span>🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {location.pathname === "/admin" && "Overview"}
            {location.pathname === "/admin/ngos" && "NGO Management"}
            {location.pathname === "/admin/reporters" && "Citizen Directory"}
            {location.pathname === "/admin/reports" &&
              "Global Incident Console"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-500">System Online</span>
          </div>
        </header>

        <div className="p-6">
          <Outlet />{" "}
          {/* This renders the child pages (Dashboard, NGOList, etc.) */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
