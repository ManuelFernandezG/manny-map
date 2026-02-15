import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { NIGHTLIFE_CATEGORIES } from "@/data/mockData";

interface CreateLocationModalProps {
  lat: number;
  lng: number;
  onSubmit: (data: { name: string; category: string; address: string; hours: string; description: string }) => void;
  onClose: () => void;
}

const CreateLocationModal = ({ lat, lng, onSubmit, onClose }: CreateLocationModalProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bar");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim().slice(0, 200);
    if (!trimmedName) return;
    onSubmit({
      name: trimmedName,
      category,
      address: address.trim().slice(0, 500),
      hours: hours.trim().slice(0, 200),
      description: description.trim().slice(0, 1000),
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[480px] bg-card border border-border rounded-t-2xl sm:rounded-2xl card-shadow animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Create Location</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's this spot called?"
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {NIGHTLIFE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address or neighborhood"
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Hours</label>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. Tue-Fri 7pm-2am"
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this place? 1-2 sentences."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          >
            Create Spot
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLocationModal;
