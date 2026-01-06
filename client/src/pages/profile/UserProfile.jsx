import { useState, useEffect } from "react";
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
  HiLocationMarker,
  HiUpload,
  HiX,
  HiPlus,
  HiMinus,
} from "react-icons/hi";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import MapContainer, { MapMarker } from "../../components/map/MapContainer";
import { processImages } from "../../utils/imageUtils";

const UserProfile = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    owner_name: user?.owner_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    website: user?.website || "",
    donation_link: user?.donation_link || "",
    service_radius_km: user?.service_radius_km || 10,
  });

  // NGO Specific State
  const [ngoFiles, setNgoFiles] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Load initial location if NGO
  // Fetch latest user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        const freshUser = data.data;

        // Update Local Storage & State
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);

        // Update Form Data
        setFormData({
          name: freshUser.name || "",
          owner_name: freshUser.owner_name || "", // Add owner name
          phone: freshUser.phone || "",
          email: freshUser.email || "",
          website: freshUser.website || "",
          donation_link: freshUser.donation_link || "",
          service_radius_km: freshUser.service_radius_km || 10,
        });
        // Update Location if NGO
        if (freshUser.role === "ngo" && freshUser.location?.coordinates) {
          setSelectedLocation({
            lat: freshUser.location.coordinates[1],
            lng: freshUser.location.coordinates[0],
          });
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Update formData when user state changes (backup)
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        owner_name: user.owner_name || "",
        phone: user.phone || "",
        email: user.email || "",
        website: user.website || "",
        donation_link: user.donation_link || "",
        service_radius_km: user.service_radius_km || 10,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    if (
      user?.role === "ngo" &&
      (e.target.name === "name" ||
        e.target.name === "owner_name" ||
        e.target.name === "phone")
    ) {
      return; // Prevent typing if disabled (backup safety)
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    // Use the shared utility
    const processed = await processImages(files);
    setNgoFiles(processed);
  };

  const handleDisabledClick = () => {
    if (user?.role === "ngo") {
      toast.info("Please contact Admin to update organization details.");
    }
  };

  const handleMapSelect = (latlng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("FormData before submit:", formData);

    try {
      let apiData = formData;
      let headers = {};

      // If NGO with Files or Location, use FormData
      if (user?.role === "ngo") {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("phone", formData.phone);
        payload.append("email", formData.email);

        if (formData.website) payload.append("website", formData.website);
        if (formData.donation_link)
          payload.append("donation_link", formData.donation_link);
        if (formData.service_radius_km)
          payload.append("service_radius_km", formData.service_radius_km);

        console.log("Website to submit:", formData.website);
        console.log("Donation link to submit:", formData.donation_link);
        console.log("Service radius to submit:", formData.service_radius_km);

        if (selectedLocation) {
          payload.append("latitude", selectedLocation.lat);
          payload.append("longitude", selectedLocation.lng);
        }

        if (ngoFiles.length > 0) {
          ngoFiles.forEach((file) => {
            payload.append("documents", file);
          });
        }
        apiData = payload;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await api.put("/auth/profile", apiData, { headers });
      const updatedUser = response.data.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setNgoFiles([]); // Clear files after upload
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
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

  const handleRadiusChange = (increment) => {
    const currentRadius =
      formData.service_radius_km || user?.service_radius_km || 10;
    const newRadius = Math.max(10, currentRadius + increment);
    setFormData({
      ...formData,
      service_radius_km: newRadius,
    });
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
              {/* Name Field (Organization Name for NGO) */}
              <div
                onClick={user?.role === "ngo" ? handleDisabledClick : undefined}
              >
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <HiUser className="inline w-4 h-4 mr-2" />
                  {user?.role === "ngo" ? "Organization Name" : "Full Name"}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={user?.role === "ngo"}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    user?.role === "ngo"
                      ? "bg-gray-100 cursor-not-allowed opacity-70"
                      : ""
                  }`}
                  required
                />
              </div>

              {/* Owner Name Field (NGO Only) */}
              {user?.role === "ngo" && (
                <div onClick={handleDisabledClick}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <HiUser className="inline w-4 h-4 mr-2" />
                    Owner / Representative Name
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed opacity-70"
                  />
                </div>
              )}

              {/* Phone Field */}
              <div
                onClick={user?.role === "ngo" ? handleDisabledClick : undefined}
              >
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <HiPhone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={user?.role === "ngo"}
                  className={`w-full px-4 py-3 border border-border bg-background text-text-primary rounded-lg ${
                    user?.role === "ngo"
                      ? "bg-gray-100 cursor-not-allowed opacity-70"
                      : ""
                  }`}
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

              {/* NGO SPECIFIC FIELDS */}
              {user?.role === "ngo" && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <h3 className="font-bold text-text-primary">
                    NGO Details update
                  </h3>

                  {/* Website Field */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      placeholder="https://your-ngo-website.com"
                      className="w-full px-4 py-3 border border-border bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Donation Link Field */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Donation Link
                    </label>
                    <input
                      type="text"
                      name="donation_link"
                      value={formData.donation_link || ""}
                      onChange={handleInputChange}
                      placeholder="Your UPI ID"
                      className="w-full px-4 py-3 border border-border bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Service Radius Field */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Service Radius (km)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRadiusChange(-10)}
                        disabled={
                          (formData.service_radius_km ||
                            user?.service_radius_km ||
                            10) <= 10
                        }
                        className="w-10 h-10 bg-error-500 hover:bg-error-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <HiMinus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-text-primary">
                          {formData.service_radius_km ||
                            user?.service_radius_km ||
                            10}{" "}
                          km
                        </div>
                        <div className="text-xs text-text-muted">
                          Coverage area radius
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRadiusChange(10)}
                        className="w-10 h-10 bg-success-500 hover:bg-success-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <HiPlus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-2 text-center">
                      Minimum: 10km • Adjusts in 10km increments
                    </p>
                  </div>

                  {/* Location Selector */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Headquarters Location
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="w-full border border-gray-300 rounded-lg p-3 flex items-center gap-3 text-text-secondary hover:bg-gray-50 transition"
                    >
                      <HiLocationMarker className="w-5 h-5 text-primary-500" />
                      {selectedLocation
                        ? `Update Location (${selectedLocation.lat.toFixed(
                            4
                          )}, ${selectedLocation.lng.toFixed(4)})`
                        : "Set HQ Location on Map"}
                    </button>
                    {selectedLocation && (
                      <p className="text-xs text-success-600 mt-1">
                        Location set. Creating a new pin will update
                        coordinates.
                      </p>
                    )}
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Supporting Documents (PDFs, Certs)
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="ngo-docs"
                      />
                      <label
                        htmlFor="ngo-docs"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <HiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-text-primary font-medium">
                          Click to Upload Documents
                        </span>
                        <span className="text-xs text-text-muted mt-1">
                          Max 3 files
                        </span>
                      </label>
                    </div>
                    {ngoFiles.length > 0 && (
                      <ul className="mt-2 text-sm text-text-secondary">
                        {ngoFiles.map((f, i) => (
                          <li key={i}>📄 {f.name}</li>
                        ))}
                      </ul>
                    )}
                    {user?.verification_docs?.length > 0 && (
                      <div className="mt-4 p-4 bg-background rounded-lg border border-border">
                        <p className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                          Verifiying Documents
                        </p>
                        <ul className="space-y-2">
                          {user.verification_docs.map((doc, i) => (
                            <li key={i}>
                              <a
                                href={doc}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors p-2 hover:bg-surface rounded-md border border-transparent hover:border-border"
                              >
                                <span className="bg-primary-100 p-1 rounded text-primary-600">
                                  📄
                                </span>
                                View Document {i + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
      {/* Map Selection Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl h-[500px] flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 right-4 z-[2001] bg-white rounded-full p-1 shadow hover:bg-gray-100"
            >
              <HiX className="w-6 h-6" />
            </button>

            <div className="flex-1 relative rounded-t-xl overflow-hidden">
              <MapContainer
                center={
                  selectedLocation
                    ? [selectedLocation.lat, selectedLocation.lng]
                    : [28.61, 77.2]
                }
                enableSearch={true}
                enableLocate={true}
                onMapClick={handleMapSelect}
              >
                {selectedLocation && (
                  <MapMarker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    type="HQ"
                    severity="Low"
                  >
                    <div>Selected Location</div>
                  </MapMarker>
                )}
              </MapContainer>
            </div>

            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  toast.info(
                    "Location staged for update. Click 'Update Profile' to save."
                  );
                }}
                disabled={!selectedLocation}
                className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                type="button"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
