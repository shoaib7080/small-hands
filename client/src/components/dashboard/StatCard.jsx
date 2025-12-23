const StatCard = ({ title, value, subtext, color }) => (
  <div className="bg-surface p-4 md:p-6 rounded-xl shadow-sm border border-border">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wide">
        {title}
      </h3>
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
    </div>
    <div className="space-y-1">
      <span className="text-3xl md:text-4xl font-bold text-text-primary block">
        {value}
      </span>
      {subtext && (
        <span className="text-xs text-text-muted block">{subtext}</span>
      )}
    </div>
  </div>
);  

export default StatCard;
