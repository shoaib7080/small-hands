import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/auth/Login";
import ReporterSignup from "./pages/auth/ReporterSignup";
import NGOSignup from "./pages/auth/NGOSignup";
import ReporterDashboard from "./pages/dashboard/ReporterDashboard";
import ReporterMap from "./pages/dashboard/ReporterMap";
import ReporterHistory from "./pages/dashboard/ReporterHistory";
import NGODashboard from "./pages/dashboard/NGODashboard";
import NGOActiveCases from "./pages/dashboard/NGOActiveCases";
import Navbar from "./components/common/Navbar";
import LandingPage from "./pages/home/LandingPage";
import Leaderboard from "./pages/home/Leaderboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNGOs from "./pages/admin/AdminNGOs";
import AdminReporters from "./pages/admin/AdminReporters";
import AdminReports from "./pages/admin/AdminReports";
import OTPVerification from "./pages/auth/OTPVerification";
import UserProfile from "./pages/profile/UserProfile";
import ResetPassword from "./pages/auth/ResetPassword";
import { requestForToken, onMessageListener } from "./firebase";
import { toast } from "react-toastify";
import NGOProfile from "./pages/profile/NGOProfile";

function App() {
  const listenerRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      requestForToken();

      // Listen for messages (Foreground) - only once
      if (!listenerRef.current) {
        listenerRef.current = onMessageListener((payload) => {
          toast.info(payload.notification.title, {
            onClick: () => {
              // Redirect to dashboard based on user role
              if (user.role === "reporter") {
                window.location.href = "/dashboard/reporter";
              } else if (user.role === "ngo") {
                window.location.href = "/dashboard/ngo";
              }
            },
          });
        });
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        limit={3}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        toastStyle={{
          fontSize: "14px",
          padding: "12px",
          maxWidth: "90vw",
          wordWrap: "break-word",
          borderRadius: "12px",
          marginTop: "12px",
        }}
      />
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/reporter" element={<ReporterSignup />} />
        <Route path="/register/ngo" element={<NGOSignup />} />
        <Route path="/auth/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/ngo/:id" element={<NGOProfile />} />

        {/* PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["reporter", "ngo", "admin", "super_admin"]}
            />
          }
        >
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["reporter"]} />}>
          <Route path="/dashboard/reporter" element={<ReporterDashboard />} />
          <Route path="/dashboard/reporter/create" element={<ReporterMap />} />
          <Route
            path="/dashboard/reporter/history"
            element={<ReporterHistory />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
          <Route path="/dashboard/ngo" element={<NGODashboard />} />
          <Route path="/dashboard/ngo/live" element={<NGOActiveCases />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["admin", "super_admin"]} />}
        >
          {/* The Layout wraps all admin pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} /> {/* /admin */}
            <Route path="ngos" element={<AdminNGOs />} /> {/* /admin/ngos */}
            <Route path="reporters" element={<AdminReporters />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
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
