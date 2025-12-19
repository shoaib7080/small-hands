import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// import { auth } from "../../components/config/firebase";
import Input from "../../components/common/Input";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../services/api";

// 1. Zod Schema (Frontend Only)
const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
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
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userData, setUserData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // const setupRecaptcha = () => {
  //   // Clean up any existing instances
  //   if (window.recaptchaVerifier) {
  //     try {
  //       window.recaptchaVerifier.clear();
  //     } catch (e) {
  //       console.log("Error clearing existing reCAPTCHA:", e);
  //     }
  //     window.recaptchaVerifier = null;
  //   }

  //   // Clear the container
  //   const container = document.getElementById("recaptcha-container");
  //   if (container) {
  //     container.innerHTML = "";
  //   }

  //   // Create new instance
  //   window.recaptchaVerifier = new RecaptchaVerifier(
  //     auth,
  //     "recaptcha-container",
  //     {
  //       size: "invisible",
  //       callback: () => {},
  //       "expired-callback": () => {
  //         toast.error("reCAPTCHA expired. Please try again.");
  //         setLoading(false);
  //       },
  //     }
  //   );
  // };

  // const onSubmit = async (data) => {
  //   if (loading) return;

  //   setLoading(true);

  //   try {
  //     setupRecaptcha();

  //     const confirmation = await signInWithPhoneNumber(
  //       auth,
  //       "+91" + data.phone,
  //       window.recaptchaVerifier
  //     );

  //     if (confirmation) {
  //       window.confirmationResult = confirmation;
  //       toast.success("OTP sent successfully!");
  //       navigate("/auth/verify-otp", {
  //         state: {
  //           userData: {
  //             name: data.name,
  //             phone: data.phone,
  //             password: data.password,
  //           },
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);

  //     if (error.code === "auth/too-many-requests") {
  //       toast.error("Too many requests. Please try again after some time.");
  //     } else if (error.message && error.message.includes("reCAPTCHA")) {
  //       toast.error("reCAPTCHA error. Please refresh the page and try again.");
  //     } else {
  //       toast.error("Failed to send OTP. Try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Send registration data and get verification email
      await api.post("/auth/register/reporter", {
        ...data,
        role: "reporter",
      });

      setUserData(data);
      setUserEmail(data.email);
      setShowVerification(true);
      toast.success("Verification code sent to your email!");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email verification
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email-registration", {
        email: userEmail,
        code: verificationCode,
      });

      toast.success("Registration completed! You can now login.");
      navigate("/login");
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // 2. New Google Logic
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      // Extract the correct data structure
      const { token, data } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Logged in with Google! 🚀");
      navigate("/dashboard/reporter");
    } catch (err) {
      toast.error("Google Login Failed. Please try again.");
    }
  };

  // Show verification form if email sent
  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter the 6-digit code sent to {userEmail}
          </p>

          <form onSubmit={handleVerifyEmail}>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full p-3 border rounded mb-4 text-center text-lg tracking-widest"
              maxLength={6}
            />

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Complete Registration"}
            </button>
          </form>

          <button
            onClick={() => setShowVerification(false)}
            className="w-full mt-2 text-gray-500 hover:text-gray-700"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    );
  }

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

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign In Failed")}
              theme="filled_blue"
              size="large"
              text="continue_with"
              width="300" // Make it wide
            />
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">
              OR LOGIN WITH EMAIL
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Rahul Verma"
              {...register("name")}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              error={errors.email}
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

          {/* <div id="recaptcha-container"></div> */}
        </div>
      </div>
    </>
  );
};

export default ReporterSignup;
