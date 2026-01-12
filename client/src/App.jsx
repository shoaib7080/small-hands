import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
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
import IssuesPage from "./pages/issues/IssuePage";
import PublicRoute from "./components/common/PublicRoute";
import CaseHistory from "./pages/dashboard/CaseHistory";

function App() {
  const listenerRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      requestForToken();

      // Socket setup
      if (!window.socket) {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const socketUrl = apiUrl.replace("/api", "");

        window.socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          reconnection: true,
        });

        // Wait for connection before emitting
        window.socket.on("connect", () => {
          console.log("Socket connected:", window.socket.id);
          window.socket.emit("join", user.id);
        });
      }

      const socket = window.socket;

      // Admin notifications
      if (user.role === "admin" || user.role === "super_admin") {
        console.log("Setting up admin socket listener");
        socket.on("admin:new-ngo-registration", (data) => {
          console.log("Received admin:new-ngo-registration", data);
          toast.info(`New NGO Registration: ${data.name}`, {
            autoClose: 5000,
            onClick: () => (window.location.href = "/admin/ngos"),
          });
        });
      }

      // NGO notifications
      if (user.role === "ngo") {
        console.log("Setting up NGO socket listener for user", user.id);
        socket.on("ngo:verification-approved", (data) => {
          console.log("Received ngo:verification-approved", data);
          toast.success(data.message, {
            autoClose: 8000,
            onClick: () => (window.location.href = "/dashboard/ngo"),
          });
        });
      }

      // FCM listener
      if (!listenerRef.current) {
        listenerRef.current = onMessageListener((payload) => {
          toast.info(payload.notification.title, {
            onClick: () => {
              if (user.role === "reporter") {
                window.location.href = "/dashboard/reporter";
              } else if (user.role === "ngo") {
                window.location.href = "/dashboard/ngo";
              }
            },
          });
        });
      }

      // Cleanup
      return () => {
        if (socket) {
          socket.off("admin:new-ngo-registration");
          socket.off("ngo:verification-approved");
        }
      };
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
        {/* PUBLIC ROUTES - Redirect if logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register/reporter"
          element={
            <PublicRoute>
              <ReporterSignup />
            </PublicRoute>
          }
        />
        <Route
          path="/register/ngo"
          element={
            <PublicRoute>
              <NGOSignup />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/verify-otp"
          element={
            <PublicRoute>
              <OTPVerification />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* These can remain public */}
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
          <Route path="/dashboard/ngo/history" element={<CaseHistory />} />
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
            <Route path="issues" element={<IssuesPage />} />
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
