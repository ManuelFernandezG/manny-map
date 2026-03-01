import { X } from "lucide-react";

interface TopLocationCardProps {
  locationName: string;
  checkinCount: number;
  vibeEmoji: string;
  onTap: () => void;
  onDismiss: () => void;
}

const TopLocationCard = ({ locationName, checkinCount, vibeEmoji, onTap, onDismiss }: TopLocationCardProps) => {
  return (
    <div className="flex justify-center pointer-events-auto">
      <div className="flex items-center gap-2 bg-[#1A3A2A]/95 backdrop-blur-md border border-[#2D5F2D] rounded-full pl-3 pr-1 py-1.5 max-w-[320px]">
        <button
          onClick={onTap}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {vibeEmoji && <span className="text-base shrink-0">{vibeEmoji}</span>}
          <span className="font-['DM_Sans'] text-[13px] font-semibold text-[#FEFEFB] truncate">
            {locationName}
          </span>
          <span className="font-['DM_Sans'] text-[11px] text-[#8FBF8F] shrink-0 whitespace-nowrap">
            {checkinCount} tonight
          </span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="p-1 rounded-full hover:bg-[#2D5F2D]/60 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-[#8FBF8F]" />
        </button>
      </div>
    </div>
  );
};

export default TopLocationCard;
