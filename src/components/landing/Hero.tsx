import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col md:flex-row items-start md:items-center gap-8 px-5 md:px-20 pt-12 pb-10 md:pt-0 md:pb-0 md:min-h-[740px]">
      {/* Left content */}
      <div className="flex flex-col gap-7 md:w-[739px] shrink-0">
        <h1
          className="font-['DM_Sans'] text-[40px] md:text-[80px] text-[#FEFEFB] leading-[1.05]"
          style={{ fontWeight: 800 }}
        >
          Organize your<br className="hidden md:block" /> plans with crowd sourced data
        </h1>
        <p className="font-['DM_Sans'] text-base md:text-[18px] text-[#918F82] leading-[1.7]">
          The free platform for finding and{" "}
          <br className="hidden md:block" />
          rating the best spots: check in, and share the vibe.
        </p>
        <div className="flex gap-3 md:gap-4 flex-wrap">
          <button
            onClick={() => navigate("/map")}
            className="font-['DM_Sans'] text-[15px] md:text-[17px] font-semibold text-[#FEFEFB] rounded-lg px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-b from-[#918f82] to-[#000000] hover:opacity-90 transition-opacity"
          >
            Open the Map
          </button>
          <a
            href="#how-it-works"
            className="font-['DM_Sans'] text-[15px] md:text-[17px] font-semibold text-[#1A2E22] rounded-lg px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-b from-[#425239] to-[#FEFEFB] hover:opacity-90 transition-opacity"
          >
            How It Works
          </a>
        </div>
      </div>

      {/* Hero mockup image */}
      <div className="w-full md:w-[520px] md:h-[600px] shrink-0">
        <img
          src="/hero_mockup.png"
          alt="Manny Map app mockup"
          className="w-full h-[280px] md:h-full object-cover rounded-xl"
        />
      </div>
    </section>
  );
};

export default Hero;
