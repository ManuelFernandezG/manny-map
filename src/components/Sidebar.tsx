import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { num: "01", label: "Map", path: "/" },
  { num: "02", label: "Ratings", path: "/ratings" },
  { num: "03", label: "Profile", path: "/profile" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col justify-between bg-[#1A3A2A] px-8 py-12">
      <div className="flex flex-col gap-[52px]">
        <span className="font-['DM_Sans'] text-[28px] font-medium text-[#8FBF8F]">
          Manny Map
        </span>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.num}
                onClick={() => item.path !== "#" && navigate(item.path)}
                className={`flex items-center gap-4 py-3 text-left text-base font-['Inter'] ${
                  isActive ? "text-white" : "text-[#7A8A7A] hover:text-[#8FBF8F]"
                } transition-colors`}
              >
                <span className="w-6">{item.num}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
