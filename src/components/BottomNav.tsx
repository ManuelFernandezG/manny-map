import { Map, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", label: "Map", icon: Map },
  { path: "/profile", label: "Profile", icon: User },
] as const;

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-display font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
