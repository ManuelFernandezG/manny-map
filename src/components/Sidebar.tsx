import { MapPin, Map, Activity, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Map", path: "/map", icon: Map },
  { label: "Ratings", path: "/ratings", icon: Activity },
  { label: "Profile", path: "/profile", icon: User },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col justify-between bg-white dark:bg-[#0F1F16] border-r border-[#E8E8E8] dark:border-[#243D2E]">
      {/* Top: logo + nav */}
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-6">
          <MapPin className="h-5 w-5 text-[#2D5F2D] shrink-0" />
          <span className="font-['DM_Sans'] text-[16px] font-semibold text-[#1C1C1C] dark:text-[#FEFEFB]">
            Manny Map
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E8E8E8] dark:bg-[#243D2E] mx-0" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/map"
                ? location.pathname === "/map"
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 h-10 px-3 rounded-md font-['DM_Sans'] text-[14px] transition-colors ${
                  isActive
                    ? "bg-[#EAF3EA] text-[#2D5F2D] font-medium dark:bg-[#2D5F2D] dark:text-[#FEFEFB]"
                    : "text-[#666666] hover:text-[#1C1C1C] dark:text-[#8FBF8F] dark:hover:text-[#FEFEFB]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#2D5F2D] dark:text-[#FEFEFB]" : "text-[#666666] dark:text-[#8FBF8F]"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: user avatar */}
      <div className="flex flex-col gap-0 px-3 pb-4">
        {/* User avatar */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-[#EAF3EA] dark:bg-[#2D5F2D] flex items-center justify-center shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="h-4 w-4 text-[#2D5F2D] dark:text-[#FEFEFB]" />
            )}
          </div>
          <span className="font-['DM_Sans'] text-[13px] text-[#666666] dark:text-[#8FBF8F] truncate">
            {user ? (user.displayName || user.email || "User") : "Guest"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
