import { MapPin, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CITIES } from "@/data/mockData";

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const CitySelector = ({ selectedCity, onCityChange }: CitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 bg-[#1A3A2A]/95 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2.5 font-['DM_Sans'] font-medium text-xs sm:text-base text-[#C5DFC5] border border-[#2D5F2D] hover:border-[#3A7A4A] transition-all duration-200"
      >
        <MapPin className="h-4 w-4 text-[#8FBF8F]" />
        {selectedCity}
        <ChevronDown className={`h-4 w-4 text-[#7A8A7A] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-[#1A3A2A] border border-[#2D5F2D] shadow-xl animate-scale-in overflow-hidden min-w-[160px]">
          {Object.keys(CITIES).map((city) => (
            <button
              key={city}
              onClick={() => {
                onCityChange(city);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 font-['DM_Sans'] font-medium transition-colors duration-150 ${
                city === selectedCity
                  ? "bg-[#2D5F2D] text-[#8FBF8F]"
                  : "text-[#C5DFC5] hover:bg-[#2D5F2D]/50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySelector;
