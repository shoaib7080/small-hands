import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  HiUser,
  HiPhone,
  HiMail,
  HiSave,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";

const UserProfile = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put("/auth/profile", formData);
      const updatedUser = response.data.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!formData.email) {
      toast.error("Please enter an email address first");
      return;
    }

    setSendingCode(true);
    try {
      await api.post("/auth/send-verification", { email: formData.email });
      toast.success("Verification code sent to your email!");
      setShowVerificationModal(true);
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-email", {
        code: verificationCode,
        email: formData.email,
      });
      const updatedUser = response.data.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Update form data to reflect the verified status
      setFormData((prev) => ({
        ...prev,
        email: updatedUser.email,
      }));

      window.location.reload();

      toast.success("Email verified successfully!");
      setShowVerificationModal(false);
      setVerificationCode("");
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === "ngo") return "/dashboard/ngo";
    if (user?.role === "admin") return "/admin";
    return "/dashboard/reporter";
  };

  return (
    <>
      <LoadingOverlay isVisible={loading} text="Processing..." />
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="text-text-secondary hover:text-primary-600 p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    My Profile
                  </h1>
                  <p className="text-text-secondary capitalize">
                    {user?.role} Account
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-surface rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <HiUser className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <HiPhone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border bg-background text-text-primary rounded-lg"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiMail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {user?.isEmailVerified && (
                    <HiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Verification Status */}
                {formData.email && (
                  <div className="mt-2">
                    {user?.isEmailVerified && formData.email === user?.email ? (
                      <p className="text-xs text-success-500 flex items-center gap-1">
                        <HiCheckCircle className="w-4 h-4" />
                        Email verified
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-error-500 flex items-center gap-1">
                          <HiXCircle className="w-4 h-4" />
                          Email not verified
                        </p>
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={sendingCode}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          {sendingCode ? "Sending..." : "Verify Email"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <HiSave className="w-5 h-5" />
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verify Email
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Enter the 6-digit code sent to {formData.email}
            </p>

            <form onSubmit={handleVerifyEmail}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                maxLength="6"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationCode("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
