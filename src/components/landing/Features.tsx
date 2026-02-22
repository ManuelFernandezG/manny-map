import { useRef, useState, useCallback } from "react";
import { Map, Activity, Star, Globe, Users, Unlock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Map,
    title: "Interactive Map",
    desc: "Explore venues on a live map of your city.",
  },
  {
    icon: Activity,
    title: "Real-Time Busyness",
    desc: "See historical popular times data for each venue at a glance.",
  },
  {
    icon: Star,
    title: "Vibe Ratings",
    desc: "Community-powered ratings for atmosphere and crowd energy.",
  },
  {
    icon: Globe,
    title: "Multi-City Support",
    desc: "Ottawa, Toronto, Montreal, and Guelph — more cities coming soon.",
  },
  {
    icon: Users,
    title: "Crowd Insights",
    desc: "Understand crowd demographics — age and gender — before you arrive.",
  },
  {
    icon: Unlock,
    title: "Free to Use",
    desc: "No sign-up required to browse spots and check the vibe.",
  },
];

const CARD_WIDTH = 270;
const CARD_GAP = 16;

const Features = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.min(
      Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP)),
      FEATURES.length - 1
    );
    setActiveIdx(idx);
  }, []);

  return (
    <section id="features" className="py-16 md:py-24 px-5 md:px-[160px]">
      <div className="flex flex-col gap-12 md:gap-16">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <span
            className="font-['DM_Sans'] text-[11px] md:text-[12px] font-semibold text-[#FEFEFB]"
            style={{ letterSpacing: "3px" }}
          >
            FEATURES
          </span>
          <h2 className="font-['DM_Sans'] text-[32px] md:text-[48px] font-bold text-[#FEFEFB]">
            Everything you need for a great night
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        {/* Mobile: horizontal scroll + interactive dots */}
        <div className="md:hidden flex flex-col gap-4">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
          >
            {FEATURES.map((f) => (
              <div key={f.title} className="shrink-0 w-[270px]">
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  scrollRef.current?.scrollTo({
                    left: i * (CARD_WIDTH + CARD_GAP),
                    behavior: "smooth",
                  });
                }}
                className={`h-2 rounded transition-all duration-200 ${
                  i === activeIdx ? "w-5 bg-[#FEFEFB]" : "w-2 bg-[#918F82]"
                }`}
                aria-label={`Go to ${FEATURES[i].title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="bg-[#243D2E] rounded-xl p-7 h-[200px] flex flex-col gap-3.5">
      <div className="w-10 h-10 rounded-lg bg-[#415436] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#FEFEFB]" />
      </div>
      <p className="font-['DM_Sans'] text-[15px] font-semibold text-[#FEFEFB]">{title}</p>
      <p
        className="font-['DM_Sans'] text-[13px] text-[#918F82]"
        style={{ lineHeight: 1.6 }}
      >
        {desc}
      </p>
    </div>
  );
}

export default Features;
