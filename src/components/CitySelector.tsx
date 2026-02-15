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
        className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-card/90 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2.5 font-display font-semibold text-xs sm:text-base text-foreground border border-border hover:border-primary/40 transition-all duration-200"
      >
        <MapPin className="h-4 w-4 text-primary" />
        {selectedCity}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 rounded-lg bg-card border border-border shadow-xl animate-scale-in overflow-hidden min-w-[160px]">
          {Object.keys(CITIES).map((city) => (
            <button
              key={city}
              onClick={() => {
                onCityChange(city);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 font-display font-medium transition-colors duration-150 ${
                city === selectedCity
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-surface-hover"
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
