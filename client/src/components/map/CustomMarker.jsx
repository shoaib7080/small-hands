import { AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  HiFlag,
  HiHeart,
  HiHome,
  HiLocationMarker,
  HiPhone,
  HiQuestionMarkCircle,
} from "react-icons/hi";
import { GiClothes } from "react-icons/gi";
import { MdFastfood, MdLocalHospital, MdCheckCircle } from "react-icons/md";

const getTypeConfig = (type) => {
  switch (type?.toLowerCase()) {
    case "food":
      return { icon: MdFastfood, color: "bg-orange-500", text: "text-white" };
    case "medical":
      return { icon: MdLocalHospital, color: "bg-red-500", text: "text-white" };
    case "shelter":
      return { icon: HiHome, color: "bg-blue-500", text: "text-white" };
    case "clothes":
      return { icon: GiClothes, color: "bg-purple-500", text: "text-white" };
    case "new":
      return {
        icon: HiLocationMarker,
        color: "bg-red-600",
        text: "text-white",
      };
    default:
      return { icon: HiFlag, color: "bg-gray-600", text: "text-white" };
  }
};

const getSeverityPulse = (severity) => {
  if (severity === "Critical")
    return "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75";
  if (severity === "High")
    return "animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75";
  return "hidden";
};

const CustomMarker = ({
  position,
  type,
  severity,
  isHighlighted = false,
  onClick,
  status,
  isUserLocation = false,
  isHQ = false,
  label,
  isMine = false,
}) => {
  // 1. User Location Pin
  if (isUserLocation) {
    return (
      <AdvancedMarker position={position} onClick={onClick}>
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-xl">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </AdvancedMarker>
    );
  }

  // 2. Resolved Case Pin
  if (status === "Resolved") {
    return (
      <AdvancedMarker
        position={position}
        onClick={onClick}
        zIndex={isHighlighted ? 50 : 1}
      >
        <div
          className={`relative flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
            isHighlighted ? "w-12 h-12" : "w-8 h-8"
          } bg-green-500 border-2 border-white`}
        >
          <MdCheckCircle className="text-white w-full h-full p-1" />
        </div>
      </AdvancedMarker>
    );
  }

  if (isHQ) {
    return (
      <AdvancedMarker position={position} onClick={onClick}>
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 border-2 border-white shadow-xl">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <HiHome className="text-white w-6 h-6 z-10" />
          </div>
          <div className="mt-1 bg-primary-600 text-white text-xs px-2 py-1 rounded shadow-lg font-medium whitespace-nowrap">
            {label || "Headquarter"}
          </div>
        </div>
      </AdvancedMarker>
    );
  }

  // 3. Normal Report Pin
  const config = getTypeConfig(type);
  // Override color if it is mine (Claimed)
  const color = isMine ? "bg-green-600" : config.color;
  const Icon = config.icon;
  const text = config.text;

  const pulseClass = getSeverityPulse(severity);

  return (
    <AdvancedMarker
      position={position}
      onClick={onClick}
      zIndex={isHighlighted ? 50 : 10}
    >
      <div className="relative flex items-center justify-center group cursor-pointer">
        {/* Pulse Animation for Severity */}
        <span
          className={`${pulseClass} ${isHighlighted ? "scale-150" : ""}`}
        ></span>

        {/* Main Marker Body */}
        <div
          className={`
            relative z-10 flex items-center justify-center rounded-full border-2 border-white shadow-xl transition-all duration-300
            ${color} 
            ${isHighlighted ? "w-12 h-12 scale-110" : "w-9 h-9 hover:scale-110"}
          `}
        >
          <Icon
            className={`${text} ${isHighlighted ? "w-6 h-6" : "w-5 h-5"}`}
          />

          {/* Tooltip on Hover */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
            {type} {type !== "HQ" && `(${severity})`} {isMine ? "(Yours)" : ""}
          </div>
        </div>

        {/* Little Triangle/Pointer at bottom to make it look like a pin */}
        <div
          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white ${
            isHighlighted ? "scale-110" : ""
          }`}
        ></div>
      </div>
    </AdvancedMarker>
  );
};

export default CustomMarker;
