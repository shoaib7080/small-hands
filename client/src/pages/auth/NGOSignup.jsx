import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import {
  Marker,
  Popup,
} from "react-leaflet";
import { toast } from "react-toastify";
import { HiLocationMarker, HiX } from "react-icons/hi";
import api from "../../services/api";
import Input from "../../components/common/Input";
import MapContainer from "../../components/map/MapContainer";
import "leaflet/dist/leaflet.css";
import { requestForToken } from "../../firebase";

// 1. Zod Schema
const ngoSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  registration_number: z.string().min(5, "License Number is required"),
  latitude: z.number({
    invalid_type_error: "Please select a location on the map",
  }),
  longitude: z.number(),
});



const NGOSignup = () => {
  const navigate = useNavigate();
  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lng }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ngoSchema),
  });

  // helper to update form
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

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, role: "ngo" };
      const response = await api.post("/auth/register/ngo", payload);

      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Sync FCM Token
      requestForToken();

      toast.success("NGO Registered Successfully!");
      navigate("/dashboard/ngo");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center text-blue-800">
          Register as NGO Partner
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Join the network to help people efficiently.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Left Column: Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">
              Organization Details
            </h3>
            <Input
              label="NGO Name"
              placeholder="Helping Hands Foundation"
              {...register("name")}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contact@ngo.org"
              {...register("email")}
              error={errors.email}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="9876543210"
              {...register("phone")}
              error={errors.phone}
            />
            <Input
              label="License / Reg. Number"
              placeholder="GOV-REG-XXXX"
              {...register("registration_number")}
              error={errors.registration_number}
            />
            <Input
              label="Password"
              type="password"
              placeholder="******"
              {...register("password")}
              error={errors.password}
            />
          </div>

          {/* Right Column: Map Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">
              Headquarters Location
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
               <p>Please pin your office location accurately so volunteers can find you.</p>
            </div>

            <button
                type="button"
                onClick={() => {
                    setShowMapModal(true);
                    // Pre-fill existing selection if re-opening
                    // if (getValues('latitude')) ... (Optional enhancement)
                }}
                className={`w-full border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-2 transition-colors ${
                    errors.latitude ? "border-red-300 bg-red-50 text-red-500" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500"
                }`}
            >
                <HiLocationMarker className="w-8 h-8" />
                <span className="font-bold">
                    {selectedLocation ? "Location Selected (Click to Change)" : "Click to Select Location"}
                </span>
                {selectedLocation && <span className="text-xs text-gray-400">({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})</span>}
            </button>
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
            
            {errors.latitude && (
              <p className="text-error-500 text-xs mt-1 text-center font-bold">
                {errors.latitude.message}
              </p>
            )}
          </div>

          {/* Submit Button (Full Width) */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50 text-lg"
            >
              {isSubmitting
                ? "Registering Organization..."
                : "Complete Registration"}
            </button>

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:underline">
                Already registered? Login here
              </Link>
            </div>
          </div>
        </form>
      </div>
      
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
                  center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [28.61, 77.2]}
                  enableSearch={true}
                  enableLocate={true}
                  onMapClick={handleMapSelect}
                >
                  {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                    <Popup>Selected Location</Popup>
                  </Marker>}
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

export default NGOSignup;
