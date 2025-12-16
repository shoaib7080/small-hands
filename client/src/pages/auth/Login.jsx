import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import Input from "../../components/common/Input";

// 1. Zod Schema for Validation
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // role: z.enum(["reporter", "ngo", "admin"]),
});

const Login = () => {
  const navigate = useNavigate();

  // 2. Setup Form Hook
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "reporter" }, // Default selection
  });

  // 3. Submit Handler
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">New here?</p>
          <div className="flex justify-center gap-2 mt-1">
            <Link
              to="/register/reporter"
              className="text-blue-500 hover:underline"
            >
              Join as Reporter
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/register/ngo" className="text-blue-500 hover:underline">
              Register NGO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
