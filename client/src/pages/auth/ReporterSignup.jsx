import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import Input from "../../components/common/Input";

// 1. Zod Schema (Frontend Only)
const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ReporterSignup = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      // 2. Prepare Payload (Remove confirmPassword)
      const payload = {
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: "reporter",
      };

      const response = await api.post("/auth/register/reporter", payload);

      // 3. Auto-Login after Signup
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Account created successfully!");
      navigate("/dashboard/reporter");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Signup failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-green-600">
          Join as Reporter
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Help your community by reporting needs.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Rahul Verma"
            {...register("name")}
            error={errors.name}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            {...register("phone")}
            error={errors.phone}
          />

          <Input
            label="Password"
            type="password"
            placeholder="******"
            {...register("password")}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="******"
            {...register("confirmPassword")}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">Already have an account?</p>
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReporterSignup;
