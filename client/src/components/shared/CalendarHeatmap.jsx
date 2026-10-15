function CalendarHeatmap({ data }) {
  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    let currentMonth = startDate.getMonth();
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const month = currentDate.getMonth();
      if (month !== currentMonth) {
        const weeksSinceStart = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        months.push({
          name: currentDate.toLocaleString("default", { month: "short" }),
          offset: weeksSinceStart
        });
        currentMonth = month;
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return months;
  };

  const weeks = [];
  let week = [];

  const firstDay = data[0]?.date;
  const startDayOfWeek = firstDay ? firstDay.getDay() : 0;

  for (let i = 0; i < startDayOfWeek; i += 1) {
    week.push(null);
  }

  data.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const getColor = (count) => {
    if (count === 0) return "bg-[#0f1419] border-[#1f2a38]";
    if (count === 1) return "bg-emerald-900/40 border-emerald-800/50";
    if (count === 2) return "bg-emerald-700/50 border-emerald-600/60";
    if (count === 3) return "bg-emerald-600/70 border-emerald-500/70";
    if (count === 4) return "bg-emerald-500/80 border-emerald-400/80";
    return "bg-emerald-400 border-emerald-300";
  };

  const monthLabels = getMonthLabels();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex mb-2 pl-8">
          {monthLabels.map((month, idx) => (
            <div key={idx} className="text-xs text-gray-400 font-semibold" style={{ marginLeft: `${month.offset * 14}px` }}>
              {month.name}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pr-2">
            {dayLabels.map((day, idx) => (
              <div key={day} className={`text-xs text-gray-500 h-3 flex items-center ${idx % 2 === 0 ? "opacity-0" : ""}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {weeks.map((weekItem, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {weekItem.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm border ${day ? getColor(day.count) : "bg-transparent border-transparent"}`}
                    title={day ? `${day.date.toLocaleDateString()}: ${day.count} submissions` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm border ${getColor(level)}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeatmap;
