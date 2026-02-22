const STEPS = [
  {
    num: "1",
    title: "Find a Spot",
    desc: "Browse the interactive map for bars, clubs, and lounges near you.",
  },
  {
    num: "2",
    title: "Check In",
    desc: "Record your visit and share basic info like group size and the crowd vibe.",
  },
  {
    num: "3",
    title: "Rate the Vibe",
    desc: "Leave a review so others know what to expect before they head out.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-5 md:px-[160px]">
      <div className="flex flex-col gap-12 md:gap-16">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <span
            className="font-['DM_Sans'] text-[11px] md:text-[12px] font-semibold text-[#FEFEFB] text-center"
            style={{ letterSpacing: "3px" }}
          >
            HOW IT WORKS
          </span>
          <h2 className="font-['DM_Sans'] text-[32px] md:text-[48px] font-bold text-[#FEFEFB]">
            Three steps to the perfect night
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="flex-1 bg-[#243D2E] rounded-xl p-6 md:p-8 flex flex-col gap-4 md:gap-5"
            >
              <div className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-[26px] bg-[#415436] flex items-center justify-center shrink-0">
                <span className="font-['DM_Sans'] text-[18px] font-bold text-[#FEFEFB]">
                  {step.num}
                </span>
              </div>
              <p className="font-['DM_Sans'] text-[17px] md:text-[18px] font-semibold text-[#FEFEFB]">
                {step.title}
              </p>
              <p
                className="font-['DM_Sans'] text-[14px] md:text-[15px] text-[#918F82]"
                style={{ lineHeight: 1.6 }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
