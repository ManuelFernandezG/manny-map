import { Search, Calendar, Plus, Download } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const METRICS = [
  { label: "Total Ratings", value: "8,432", change: "↑ 12.5%", positive: true },
  { label: "Avg. Rating", value: "4.6", change: "↑ 0.3", positive: true },
  { label: "Locations Rated", value: "1,247", change: "↑ 8.2%", positive: true },
  { label: "Ratings This Week", value: "342", change: "↑ 15.4%", positive: true },
];

const BARS = [
  { label: "Mon", height: "67%" },
  { label: "Tue", height: "50%" },
  { label: "Wed", height: "83%" },
  { label: "Thu", height: "39%" },
  { label: "Fri", height: "72%" },
  { label: "Sat", height: "89%" },
  { label: "Sun", height: "56%" },
];

const ACTIVITY = [
  { title: "New 5-star rating", desc: "Sunset Lounge — by @alex", badge: "New", badgeColor: "text-[#7A8A7A]" },
  { title: "Rating milestone reached", desc: "Brooklyn Coffee House hit 100 ratings", badge: "Done", badgeColor: "text-[#8FBF8F]" },
  { title: "Weekly ratings report", desc: "Feb 10 – Feb 16 summary", badge: "Pending", badgeColor: "text-[#5A6A5A]" },
  { title: "Top rated this week", desc: "Skyline Rooftop — avg 4.8", badge: "New", badgeColor: "text-[#7A8A7A]" },
];

const LOCATIONS = [
  { name: "Sunset Lounge", category: "Nightlife", ratings: "2,847", avg: "4.8", trend: "↑ 0.2", trendPositive: true },
  { name: "Brooklyn Coffee House", category: "Food", ratings: "1,923", avg: "4.6", trend: "↑ 0.1", trendPositive: true },
  { name: "Skyline Rooftop Bar", category: "Nightlife", ratings: "1,456", avg: "4.5", trend: "↑ 0.3", trendPositive: true },
  { name: "The Green Room", category: "Food", ratings: "987", avg: "4.3", trend: "↓ 0.1", trendPositive: false },
  { name: "Neon Nights Club", category: "Nightlife", ratings: "754", avg: "4.1", trend: "— 0.0", trendPositive: null },
];

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-6 pb-20 md:p-12 md:pb-12">
        <div className="flex flex-col gap-8 md:gap-14">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-['Instrument_Serif'] text-4xl md:text-[64px] italic leading-none text-black">
                Overview
              </h1>
              <p className="font-['Inter'] text-sm md:text-base text-[#666666]">
                Track your ratings and location engagement
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2.5 bg-white px-4 py-3">
                <Search className="h-4 w-4 text-[#888888]" />
                <span className="font-['Inter'] text-sm text-[#AAAAAA]">Search...</span>
              </button>
              <button className="flex items-center gap-2.5 bg-white px-4 py-3">
                <Calendar className="h-4 w-4 text-[#888888]" />
                <span className="font-['Inter'] text-sm text-[#333333]">Last 30 days</span>
              </button>
              <button className="flex items-center gap-2.5 bg-[#2D5F2D] px-5 py-3">
                <Plus className="h-4 w-4 text-white" />
                <span className="font-['Inter'] text-sm font-medium text-white">New Location</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {METRICS.map((m) => (
              <div key={m.label} className="flex flex-col gap-3 md:gap-5 bg-white p-5 md:p-7">
                <span className="font-['Inter'] text-[13px] text-[#888888]">{m.label}</span>
                <span className="font-['Instrument_Serif'] text-3xl md:text-[44px] italic leading-none text-black">
                  {m.value}
                </span>
                <span className={`font-['Inter'] text-sm font-medium ${m.positive ? "text-[#2D5F2D]" : "text-[#888888]"}`}>
                  {m.change}
                </span>
              </div>
            ))}
          </div>

          {/* Chart + Activity Feed */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bar Chart */}
            <div className="flex flex-1 flex-col gap-7 bg-white p-7">
              <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">Rating Trends</h2>
              <div className="flex h-[180px] items-end gap-4">
                {BARS.map((bar, i) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center justify-end gap-3 h-full">
                    <div
                      className={`w-full ${i % 2 === 0 ? "bg-[#2D5F2D]" : "bg-[#3A7A4A]"}`}
                      style={{ height: bar.height }}
                    />
                    <span className="font-['Inter'] text-xs text-black">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="flex w-full md:w-[380px] md:shrink-0 flex-col gap-7 bg-[#1A3A2A] p-7">
              <div className="flex items-center justify-between">
                <h2 className="font-['Instrument_Serif'] text-2xl italic text-white">Recent Activity</h2>
                <span className="font-['Inter'] text-[13px] font-medium text-white cursor-pointer">View all →</span>
              </div>
              <div className="flex flex-col">
                {ACTIVITY.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-4 ${
                      i < ACTIVITY.length - 1 ? "border-b border-[#2D5F2D]" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="font-['Inter'] text-sm font-medium text-white">{item.title}</span>
                      <span className="font-['Inter'] text-[13px] text-[#888888]">{item.desc}</span>
                    </div>
                    <span className={`font-['Instrument_Serif'] text-base italic ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex flex-col gap-6 bg-white p-5 md:p-7 overflow-x-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">Top Rated Locations</h2>
              <button className="flex items-center gap-2.5 bg-[#2D5F2D] px-4 py-2.5">
                <Download className="h-3.5 w-3.5 text-white" />
                <span className="font-['Inter'] text-[13px] font-medium text-white">Export</span>
              </button>
            </div>
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Location</th>
                  <th className="w-[150px] py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Category</th>
                  <th className="w-[100px] py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Ratings</th>
                  <th className="w-[80px] py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Avg Score</th>
                  <th className="w-[100px] py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Trend</th>
                </tr>
              </thead>
              <tbody>
                {LOCATIONS.map((loc, i) => (
                  <tr key={i} className={i < LOCATIONS.length - 1 ? "border-b border-[#F0F0F0]" : ""}>
                    <td className="py-4 font-['Inter'] text-sm font-medium text-black">{loc.name}</td>
                    <td className="py-4 font-['Inter'] text-sm text-[#666666]">{loc.category}</td>
                    <td className="py-4 font-['Inter'] text-sm text-black">{loc.ratings}</td>
                    <td className="py-4 font-['Inter'] text-sm text-black">{loc.avg}</td>
                    <td className={`py-4 font-['Inter'] text-sm font-medium ${
                      loc.trendPositive === true ? "text-[#2D5F2D]" : loc.trendPositive === false ? "text-[#888888]" : "text-[#CCCCCC]"
                    }`}>
                      {loc.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
