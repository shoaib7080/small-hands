import { Link, Navigate } from "react-router-dom";

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Bridge the Gap Between <br />{" "}
          <span className="text-blue-600">Need & Help</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Small Hands is a real-time aid network. Citizens report needs, and
          nearby NGOs get notified instantly to respond.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            to="/register/reporter"
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-xl transition transform hover:scale-105"
          >
            I Want to Help 📸
          </Link>
          <Link
            to="/register/ngo"
            className="bg-white text-blue-800 border-2 border-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition"
          >
            Register NGO 🏢
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
          <p className="text-gray-500 font-medium">Active NGOs</p>
        </div>
        <div className="p-6">
          <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
          <p className="text-gray-500 font-medium">Lives Impacted</p>
        </div>
        <div className="p-6">
          <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
          <p className="text-gray-500 font-medium">Real-time Response</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold mb-2">1. Spot a Need</h3>
            <p className="text-gray-600">
              See someone homeless or hungry? Open the app and pin their
              location anonymously.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="text-5xl mb-4">🚨</div>
            <h3 className="text-xl font-bold mb-2">2. Instant Alert</h3>
            <p className="text-gray-600">
              Nearby NGOs receive a real-time "Red Alert" on their command
              console.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2">3. Help Arrives</h3>
            <p className="text-gray-600">
              An NGO claims the case and dispatches a team. You get notified
              when it's resolved!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        &copy; 2025 Small Hands Initiative. Built for humanity.
      </div>
    </div>
  );
};

export default LandingPage;
