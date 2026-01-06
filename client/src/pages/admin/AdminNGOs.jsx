import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { HiLocationMarker, HiX } from "react-icons/hi";
import api from "../../services/api";
import Input from "../../components/common/Input";
import ReportHistoryModal from "./ReportHistoryModal";
import MapContainer, { MapMarker } from "../../components/map/MapContainer";

const AdminNGOs = () => {
  const [activeTab, setActiveTab] = useState("pending"); // pending | verified | add
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);

  // Form for Manual Creation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Map Selection State
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lng }

  const handleMapSelect = (latlng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      setValue("latitude", selectedLocation.lat);
      setValue("longitude", selectedLocation.lng);
      setShowMapModal(false);
      toast.success("Location Selected");
    }
  };

  // Fetch NGOs based on Tab
  useEffect(() => {
    if (activeTab === "add") return;

    const fetchNGOs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/ngos?status=${activeTab}`);
        setNgos(data.data);
      } catch (err) {
        toast.error("Failed to fetch list");
      } finally {
        setLoading(false);
      }
    };
    fetchNGOs();
  }, [activeTab]);

  // Actions
  const handleVerify = async (id) => {
    if (!window.confirm("Approve this NGO? They will gain access immediately."))
      return;
    try {
      await api.patch(`/admin/ngos/${id}/verify`);
      toast.success("NGO Verified Successfully!");
      setNgos((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this account?")) return;
    try {
      await api.delete(`/admin/ngos/${id}`);
      toast.success("Account Removed");
      setNgos((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleManualCreate = async (data) => {
    try {
      await api.post("/admin/ngos", data);
      toast.success("Trusted NGO Created!");
      reset();
      setActiveTab("verified"); // Switch to list to see it
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm min-h-[500px]">
      {/* TABS HEADER */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-4 font-bold text-sm ${
            activeTab === "pending"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          ⏳ Pending Review
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={`px-6 py-4 font-bold text-sm ${
            activeTab === "verified"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          ✅ Verified Partners
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-6 py-4 font-bold text-sm ${
            activeTab === "add"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          ➕ Add Trusted NGO
        </button>
      </div>

      <div className="p-6">
        {/* VIEW 1 & 2: TABLES (Pending/Verified) */}
        {activeTab !== "add" && (
          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading...</p>
            ) : ngos.length === 0 ? (
              <p className="text-gray-500 italic">No records found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4">Organization</th>
                    <th className="p-4">License / Reg. No</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ngos.map((ngo) => (
                    <tr key={ngo._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{ngo.name}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(ngo.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 font-mono text-sm">
                        {ngo.registration_number}
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{ngo.email}</p>
                        <p className="text-xs text-gray-500">{ngo.phone}</p>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {activeTab === "pending" && (
                          <button
                            onClick={() => handleVerify(ngo._id)}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200"
                          >
                            Approve
                          </button>
                        )}
                        {activeTab === "verified" && (
                          <button
                            onClick={() => setHistoryTarget(ngo._id)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 ml-2"
                          >
                            View History
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ngo._id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200"
                        >
                          {activeTab === "pending" ? "Reject" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VIEW 3: MANUAL CREATION FORM */}
        {activeTab === "add" && (
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Manually Onboard a Partner
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will create an account that is{" "}
              <strong>Verified by Default</strong>. Use this for trusted
              organizations.
            </p>

            <form
              onSubmit={handleSubmit(handleManualCreate)}
              className="space-y-4"
            >
              <Input
                label="NGO Name"
                placeholder="e.g. Red Cross Local"
                {...register("name", { required: true })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="official@ngo.org"
                  {...register("email", { required: true })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="9876543210"
                  {...register("phone", { required: true })}
                />
              </div>
              <Input
                label="License Number"
                placeholder="GOV-REG-1234"
                {...register("registration_number", { required: true })}
              />
              <Input
                label="Set Password"
                type="password"
                placeholder="******"
                {...register("password", { required: true })}
              />

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HQ Location
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="flex-1 border border-gray-300 rounded p-2 text-left text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <HiLocationMarker className="text-blue-600" />
                    {watch("latitude")
                      ? "Location Selected (Click to change)"
                      : "Select Location on Map"}
                  </button>
                  <input
                    type="hidden"
                    {...register("latitude", {
                      required: "Location is required",
                    })}
                  />
                  <input
                    type="hidden"
                    {...register("longitude", { required: true })}
                  />
                </div>
                {errors.latitude && (
                  <p className="text-red-500 text-xs mt-1">
                    Location is required
                  </p>
                )}
              </div>

              <button className="w-full bg-blue-800 text-white font-bold py-3 rounded hover:bg-blue-900 transition">
                Create Verified Account
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Render Modal if state exists */}
      {historyTarget && (
        <ReportHistoryModal
          targetId={historyTarget}
          type="ngo"
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {/* 4. Map Selection Modal */}
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
                onClick={confirmLocation}
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
    </div>
  );
};

export default AdminNGOs;
