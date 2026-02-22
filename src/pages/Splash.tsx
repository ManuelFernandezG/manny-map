import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 md:gap-10 min-h-screen bg-[#1A3A2A]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3.5">
        <MapPin className="h-11 w-11 md:h-14 md:w-14 text-[#4A9A4A]" />
        <span className="font-['DM_Sans'] text-[28px] md:text-[38px] font-semibold text-[#FEFEFB]">
          Manny Map
        </span>
      </div>

      {/* Loading bar */}
      <div className="w-12 md:w-16 h-[3px] bg-[#2D5F2D] rounded-sm overflow-hidden">
        <div
          className="h-full bg-[#7ABF7A] rounded-sm animate-[loadBar_1.6s_ease-in-out_forwards]"
          style={{ width: "0%" }}
        />
      </div>

      <style>{`
        @keyframes loadBar {
          0%   { width: 0% }
          60%  { width: 70% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
};

export default Splash;
