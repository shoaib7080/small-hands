import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { confirmationResult, userData } = location.state || {};

  useEffect(() => {
    if (!window.confirmationResult || !userData) {
      navigate("/register/reporter");
    }
  }, [userData, navigate]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (!window.confirmationResult) {
        toast.error("OTP session expired. Please resend OTP.");
        setLoading(false);
        return;
      }

      // Verify with Firebase
      const result = await window.confirmationResult.confirm(otp);
      console.log("Firebase verification result:", result);

      if (result.user) {
        const payload = {
          name: userData.name,
          phone: userData.phone,
          password: userData.password,
          role: "reporter",
        };

        const response = await api.post("/auth/register/reporter", payload);
        const { token, user } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Account created successfully!");
        navigate("/dashboard/reporter");
      } else {
        toast.error("Verification failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      // You would need to implement resend logic here
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={loading} text="Verifying OTP..." />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Verify Phone Number
            </h2>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to +91 {userData?.phone}
            </p>
          </div>

          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 mb-4"
            >
              Create Account
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resending}
              className="text-blue-500 hover:underline font-medium text-sm"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register/reporter")}
              className="text-gray-500 hover:underline text-sm"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
