import { Map, User, BarChart3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/map", label: "Map", icon: Map },
  { path: "/ratings", label: "Ratings", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
] as const;

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#1A3A2A]/95 backdrop-blur-md border-t border-[#2D5F2D] md:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors ${
                active
                  ? "text-[#8FBF8F]"
                  : "text-[#7A8A7A] hover:text-[#C5DFC5]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-['DM_Sans'] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
