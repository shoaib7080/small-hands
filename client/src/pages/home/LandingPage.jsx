import { Link, Navigate } from "react-router-dom";
import {
  HiLocationMarker,
  HiLightningBolt,
  HiTruck,
  HiUserGroup,
  HiCheckCircle,
  HiClock,
} from "react-icons/hi";

const LandingPage = () => {
  // Check if user is already logged in
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect to their respective dashboard
  if (user) {
    if (user.role === "reporter")
      return <Navigate to="/dashboard/reporter" replace />;
    if (user.role === "ngo") return <Navigate to="/dashboard/ngo" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">
          Bridge the Gap Between <br />
          <span className="text-primary-600">Need & Help</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Small Hands is a real-time aid network. Citizens report needs, and
          nearby NGOs get notified instantly to respond.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            to="/register/reporter"
            className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <HiLocationMarker className="w-6 h-6" />
            Report Someone in Need
          </Link>
          <Link
            to="/register/ngo"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition flex items-center justify-center gap-2"
          >
            <HiUserGroup className="w-6 h-6" />
            Register as NGO
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-surface rounded-xl shadow-sm border border-border">
          <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
          <p className="text-text-secondary font-medium">Active NGOs</p>
        </div>
        <div className="p-6 bg-surface rounded-xl shadow-sm border border-border">
          <div className="text-4xl font-bold text-success-500 mb-2">500+</div>
          <p className="text-text-secondary font-medium">Lives Impacted</p>
        </div>
        <div className="p-6 bg-surface rounded-xl shadow-sm border border-border">
          <div className="text-4xl font-bold text-warning-500 mb-2">24/7</div>
          <p className="text-text-secondary font-medium">Real-time Response</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-surface py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">
          How It Works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiLocationMarker className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-text-primary">
              1. Spot a Need
            </h3>
            <p className="text-text-secondary">
              See someone homeless or hungry? Open the app and pin their
              location anonymously.
            </p>
          </div>

          <div className="bg-background p-8 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiLightningBolt className="w-8 h-8 text-error-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-text-primary">
              2. Instant Alert
            </h3>
            <p className="text-text-secondary">
              Nearby NGOs receive a real-time alert on their command console.
            </p>
          </div>

          <div className="bg-background p-8 rounded-xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-text-primary">
              3. Help Arrives
            </h3>
            <p className="text-text-secondary">
              An NGO claims the case and dispatches a team. You get notified
              when it's resolved!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-sidebar-bg text-sidebar-text py-8 text-center text-sm">
        &copy; 2025 Small Hands Initiative. Built for humanity.
      </div>
    </div>
  );
};

export default LandingPage;
