import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../components/config/firebase";
import Input from "../../components/common/Input";
import LoadingOverlay from "../../components/common/LoadingOverlay";

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
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const setupRecaptcha = () => {
    // Clean up any existing instances
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log("Error clearing existing reCAPTCHA:", e);
      }
      window.recaptchaVerifier = null;
    }

    // Clear the container
    const container = document.getElementById("recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    // Create new instance
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try again.");
          setLoading(false);
        },
      }
    );
  };

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);

    try {
      setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + data.phone,
        window.recaptchaVerifier
      );

      if (confirmation) {
        window.confirmationResult = confirmation;
        toast.success("OTP sent successfully!");
        navigate("/auth/verify-otp", {
          state: {
            userData: {
              name: data.name,
              phone: data.phone,
              password: data.password,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again after some time.");
      } else if (error.message && error.message.includes("reCAPTCHA")) {
        toast.error("reCAPTCHA error. Please refresh the page and try again.");
      } else {
        toast.error("Failed to send OTP. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={loading} text="Sending OTP..." />
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
              disabled={isSubmitting || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 mt-2"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
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

          <div id="recaptcha-container"></div>
        </div>
      </div>
    </>
  );
};

export default ReporterSignup;
