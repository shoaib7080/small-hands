import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { HiMail, HiLockClosed } from "react-icons/hi";
import api from "../../services/api";
import Input from "../../components/common/Input";
import LoadingOverlay from "../../components/common/LoadingOverlay";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  // 2. Setup Form Hook
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "reporter" }, // Default selection
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/login", data);

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back, ${response.data.data.user.name}!`);

      // Redirect based on Role
      if (user.role === "reporter") navigate("/dashboard/reporter");
      else if (user.role === "ngo") navigate("/dashboard/ngo");
      else if (user.role === "admin") navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email: resetEmail });
      toast.success("Password reset link sent to your email!");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={sendingReset} text="Sending reset email..." />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary-600">
            Small Hands Login
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Phone, Email or Username"
              type="text"
              placeholder="e.g. 9876543210"
              {...register("identifier")}
              error={errors.identifier}
            />

            <Input
              label="Password"
              type="password"
              placeholder="******"
              {...register("password")}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 mb-4"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mb-4">
            <Link
              to="/reset-password"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="text-center text-sm">
            <p className="text-text-secondary">New here?</p>
            <div className="flex justify-center gap-2 mt-1">
              <Link
                to="/register/reporter"
                className="text-primary-600 hover:underline"
              >
                Join as Reporter
              </Link>
              <span className="text-text-muted">|</span>
              <Link
                to="/register/ngo"
                className="text-primary-600 hover:underline"
              >
                Register NGO
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {/* {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Reset Password
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Enter your email address and we'll send you a reset link
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <HiMail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReset}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {sendingReset ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </>
  );
};

export default Login;
