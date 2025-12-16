import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import api from "../../services/api";
import Input from "../../components/common/Input";
import "leaflet/dist/leaflet.css";

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

// 2. Map Component to Handle Clicks
const LocationMarker = ({ setLocation }) => {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(e.latlng.lat, e.latlng.lng); // Update Form
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const NGOSignup = () => {
  const navigate = useNavigate();
  const [mapReady, setMapReady] = useState(false); // Fix for Leaflet rendering issues

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ngoSchema),
  });

  // Helper to update React Hook Form manually
  const setLocation = (lat, lng) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    toast.info("Location Selected!");
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, role: "ngo" };
      const response = await api.post("/auth/register/ngo", payload);

      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

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

          {/* Right Column: Map */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">
              Headquarters Location
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Click on the map to pin your office location.
            </p>

            <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300 relative z-0">
              <MapContainer
                center={[28.6139, 77.209]}
                zoom={11}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker setLocation={setLocation} />
              </MapContainer>
            </div>
            {errors.latitude && (
              <p className="text-red-500 text-xs mt-1 text-center font-bold">
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
    </div>
  );
};

export default NGOSignup;
