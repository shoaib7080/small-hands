import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/auth/Login";
import ReporterSignup from "./pages/auth/ReporterSignup";
import NGOSignup from "./pages/auth/NGOSignup";
import ReporterDashboard from "./pages/dashboard/ReporterDashboard";
import ReporterMap from "./pages/dashboard/ReporterMap";
import NGODashboard from "./pages/dashboard/NGODashboard";
import NGOActiveCases from "./pages/dashboard/NGOActiveCases";
import Navbar from "./components/common/Navbar";
import LandingPage from "./pages/home/LandingPage";
import Leaderboard from "./pages/home/Leaderboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/reporter" element={<ReporterSignup />} />
        <Route path="/register/ngo" element={<NGOSignup />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["reporter"]} />}>
          <Route path="/dashboard/reporter" element={<ReporterDashboard />} />
          <Route path="/dashboard/reporter/create" element={<ReporterMap />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
          <Route path="/dashboard/ngo" element={<NGODashboard />} />
          <Route path="/dashboard/ngo/live" element={<NGOActiveCases />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin"
            element={
              <div className="p-10 text-2xl font-bold">
                Admin Panel Coming Soon
              </div>
            }
          />
        </Route>

        {/* 404 Handler */}
        <Route
          path="*"
          element={
            <div className="text-center p-20 text-xl">404 - Page Not Found</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
