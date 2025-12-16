import { useEffect, useState } from "react";
import api from "../../services/api";

const Leaderboard = () => {
  const [data, setData] = useState({ reporters: [], ngos: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/leaderboard");
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const RankBadge = ({ rank }) => {
    if (rank === 0) return <span className="text-2xl">🥇</span>;
    if (rank === 1) return <span className="text-2xl">🥈</span>;
    if (rank === 2) return <span className="text-2xl">🥉</span>;
    return <span className="font-bold text-gray-500">#{rank + 1}</span>;
  };

  if (loading)
    return <div className="p-10 text-center">Loading Champions...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900">
          Hall of Fame 🏆
        </h1>
        <p className="text-gray-500 mt-2">
          Celebrating the heroes making a difference.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Reporters Column */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Top Citizens</h2>
            <p className="opacity-90 text-sm">Most Verified Reports</p>
          </div>
          <div className="p-4">
            {data.reporters.map((user, index) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-blue-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <RankBadge rank={index} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <div className="flex gap-1 mt-1">
                      {user.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    {user.karma_points}
                  </p>
                  <p className="text-xs text-gray-400">Karma</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NGOs Column */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Top NGOs</h2>
            <p className="opacity-90 text-sm">Most Lives Impacted</p>
          </div>
          <div className="p-4">
            {data.ngos.map((ngo, index) => (
              <div
                key={ngo._id}
                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-green-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <RankBadge rank={index} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{ngo.name}</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {ngo.verification_status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {ngo.impact_score}
                  </p>
                  <p className="text-xs text-gray-400">Impact</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
