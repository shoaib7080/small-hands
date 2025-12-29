const StatCard = ({ title, value, subtext, color, onClick, icon: Icon }) => (
  <div
    className={`bg-surface p-4 md:p-6 rounded-xl shadow-sm border border-border ${
      onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-stretch gap-4 h-full">
      {Icon && (
        <div className="w-13 bg-primary-500 rounded-lg flex items-center justify-center ">
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center">
        <span className="text-2xl md:text-3xl font-bold text-text-primary block mb-1">
          {value}
        </span>
        <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        {subtext && (
          <span className="text-xs text-text-muted block mt-1">{subtext}</span>
        )}
      </div>
    </div>
  </div>
);

export default StatCard;
