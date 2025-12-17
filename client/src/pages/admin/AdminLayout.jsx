import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiChartBar,
  HiOfficeBuilding,
  HiUsers,
  HiExclamationCircle,
  HiLogout,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Full page refresh and redirect
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
          isActive
            ? "bg-primary-600 text-surface"
            : "text-text-secondary hover:bg-primary-700/20 hover:text-surface"
        }`}
      >
        <Icon className="w-5 h-5" />
        {isSidebarOpen && <span className="font-medium">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-sidebar-bg text-sidebar-text transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold tracking-wider text-primary-500">
              ADMIN PANEL
            </h1>
          ) : (
            <h1 className="text-xl font-bold text-primary-500 mx-auto">AP</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {isSidebarOpen ? (
              <HiChevronLeft className="w-5 h-5" />
            ) : (
              <HiChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <NavItem to="/admin" icon={HiChartBar} label="Dashboard" />
          <NavItem
            to="/admin/ngos"
            icon={HiOfficeBuilding}
            label="Manage NGOs"
          />
          <NavItem to="/admin/reporters" icon={HiUsers} label="Reporters" />
          <NavItem
            to="/admin/reports"
            icon={HiExclamationCircle}
            label="All Reports"
          />
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-error-500 hover:bg-error-500/10 transition-colors"
          >
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">
            {location.pathname === "/admin" && "Overview"}
            {location.pathname === "/admin/ngos" && "NGO Management"}
            {location.pathname === "/admin/reporters" && "Citizen Directory"}
            {location.pathname === "/admin/reports" &&
              "Global Incident Console"}
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full border border-green-300">
            <span className="h-2 w-2 bg-accent-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-text-secondary">System Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
