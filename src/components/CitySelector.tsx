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
        className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2.5 font-['DM_Sans'] font-medium text-xs sm:text-base text-[#333] border border-[#E0E0E0] hover:border-[#2D5F2D] transition-all duration-200 rounded-lg"
      >
        <MapPin className="h-4 w-4 text-[#2D5F2D]" />
        {selectedCity}
        <ChevronDown className={`h-4 w-4 text-[#888] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-[#E0E0E0] shadow-lg rounded-lg animate-scale-in overflow-hidden min-w-[160px]">
          {Object.keys(CITIES).map((city) => (
            <button
              key={city}
              onClick={() => {
                onCityChange(city);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 font-['DM_Sans'] font-medium transition-colors duration-150 ${
                city === selectedCity
                  ? "bg-[#2D5F2D] text-white"
                  : "text-[#333] hover:bg-[#F5F5F5]"
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
