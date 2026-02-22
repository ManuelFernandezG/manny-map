import { useNavigate } from "react-router-dom";

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between h-[72px] px-5 md:px-20 w-full">
      <span className="font-['DM_Sans'] text-[22px] font-semibold text-[#FEFEFB]">
        Manny Map
      </span>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-10">
        <a href="#" className="font-['DM_Sans'] text-[15px] font-medium text-[#FEFEFB] hover:opacity-80 transition-opacity">
          Home
        </a>
        <a href="#how-it-works" className="font-['DM_Sans'] text-[15px] font-medium text-[#918F82] hover:text-[#FEFEFB] transition-colors">
          How It Works
        </a>
        <a href="#features" className="font-['DM_Sans'] text-[15px] font-medium text-[#918F82] hover:text-[#FEFEFB] transition-colors">
          Features
        </a>
        <button
          onClick={() => navigate("/ratings")}
          className="font-['DM_Sans'] text-[15px] font-medium text-[#918F82] hover:text-[#FEFEFB] transition-colors"
        >
          Ratings
        </button>
      </nav>

      {/* Mobile hamburger */}
      <span className="md:hidden font-['DM_Sans'] text-[22px] text-[#FEFEFB]">☰</span>
    </header>
  );
};

export default LandingHeader;
