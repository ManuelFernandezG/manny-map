import { X, Sparkles, TrendingUp, Bell } from "lucide-react";

interface SignupPromptProps {
  onClose: () => void;
  onSignup: () => void;
  onSkip: () => void;
}

const SignupPrompt = ({ onClose, onSignup, onSkip }: SignupPromptProps) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:w-[480px] bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden card-shadow animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-hover transition-colors z-10"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 pb-6 border-b border-border">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">
            You're on fire! 🔥
          </h2>
          <p className="text-center text-muted-foreground text-sm">
            You've rated 3 spots. Create an account to unlock more features!
          </p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground mb-1">Personalized Feed</p>
              <p className="text-sm text-muted-foreground">
                Get recommendations based on your age group and taste
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground mb-1">Track Your Ratings</p>
              <p className="text-sm text-muted-foreground">
                See all the spots you've rated and discover patterns
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground mb-1">Exclusive Features</p>
              <p className="text-sm text-muted-foreground">
                Save favorites, get notified of new spots, and more
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 space-y-3">
          <button
            onClick={onSignup}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all hover:opacity-90 glow-lime"
          >
            Create Free Account
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2.5 rounded-lg text-muted-foreground font-display font-medium text-sm hover:text-foreground hover:bg-surface transition-colors"
          >
            Maybe later
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            Continue rating anonymously or sign up to sync across devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPrompt;
