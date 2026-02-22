import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* CTA Strip */}
      <section className="py-16 md:py-24 px-5 md:px-[160px] flex flex-col items-center gap-6 md:gap-8 text-center">
        <h2
          className="font-['DM_Sans'] text-[32px] md:text-[52px] font-bold text-[#FEFEFB] leading-tight max-w-[620px]"
          style={{ height: undefined }}
        >
          Ready to find your ideal spot today?
        </h2>
        <p className="font-['DM_Sans'] text-base md:text-[18px] text-[#918F82]">
          Join real people discovering the best spots
        </p>
        <button
          onClick={() => navigate("/map")}
          className="font-['DM_Sans'] text-[16px] md:text-[17px] font-semibold text-[#1A2E22] bg-[#FEFEFB] rounded-lg px-10 md:px-12 py-4 hover:opacity-90 transition-opacity"
        >
          Open the Map →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#152519] h-[80px] md:h-[100px] flex items-center justify-center gap-4">
        <span className="font-['DM_Sans'] text-[16px] font-semibold text-[#FEFEFB]">Manny Map</span>
        <span className="font-['DM_Sans'] text-[13px] text-[#918F82]">2026</span>
      </footer>
    </>
  );
};

export default CTASection;
