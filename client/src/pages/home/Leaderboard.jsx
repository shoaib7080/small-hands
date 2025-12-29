import { useEffect, useState } from "react";
import { HiStar, HiUsers, HiOfficeBuilding } from "react-icons/hi";
import { HiOutlineTrophy } from "react-icons/hi2";
import api from "../../services/api";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { Link } from "react-router-dom";

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
    if (rank === 0)
      return <HiOutlineTrophy className="w-6 h-6 text-warning-500" />;
    if (rank === 1)
      return <HiOutlineTrophy className="w-6 h-6 text-gray-400" />;
    if (rank === 2)
      return <HiOutlineTrophy className="w-6 h-6 text-amber-600" />;
    return (
      <span className="font-bold text-text-muted text-sm">#{rank + 1}</span>
    );
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <LoadingOverlay isVisible={loading} text="Loading Champions..." />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HiOutlineTrophy className="w-8 h-8 text-warning-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Hall of Fame
          </h1>
        </div>
        <p className="text-text-secondary">
          Celebrating the heroes making a difference.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reporters Column */}
        {/* <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-primary-500 p-4 md:p-6 text-white">
            <div className="flex items-center gap-3 justify-center">
              <HiUsers className="w-6 h-6" />
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold">Top Citizens</h2>
                <p className="text-primary-100 text-sm">
                  Most Verified Reports
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {data.reporters.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <HiUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reporters yet</p>
              </div>
            ) : (
              data.reporters.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 flex justify-center">
                      <RankBadge rank={index} />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm md:text-base">
                        {user.name}
                      </p>
                      {user.badges?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.badges.slice(0, 2).map((badge) => (
                            <span
                              key={badge}
                              className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <HiStar className="w-4 h-4 text-warning-500" />
                      <p className="text-lg md:text-xl font-bold text-primary-600">
                        {user.karma_points}
                      </p>
                    </div>
                    <p className="text-xs text-text-muted">Karma</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}

        {/* NGOs Column */}
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-success-500 p-4 md:p-6 text-white">
            <div className="flex items-center gap-3 justify-center">
              <HiOfficeBuilding className="w-6 h-6" />
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold">Top NGOs</h2>
                <p className="text-success-100 text-sm">Most Lives Impacted</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {data.ngos.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <HiOfficeBuilding className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No NGOs yet</p>
              </div>
            ) : (
              data.ngos.map((ngo, index) => (
                <div
                  key={ngo._id}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 flex justify-center">
                      <RankBadge rank={index} />
                    </div>
                    <div>
                      {/* <p className="font-medium text-text-primary text-sm md:text-base">
                        
                      </p> */}
                      <Link
                        to={`/ngo/${ngo._id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {ngo.name}
                      </Link>
                      <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full capitalize">
                        {ngo.verification_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-xl font-bold text-success-600">
                      {ngo.impact_score}
                    </p>
                    <p className="text-xs text-text-muted">Impact</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
