import { X, Sparkles, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const { signInWithGoogle } = useAuth();
  const [signing, setSigning] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigning(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        // User closed the popup, no error needed
      } else {
        toast.error("Sign in failed. Please try again.");
        console.error("Auth error:", err);
      }
    } finally {
      setSigning(false);
    }
  };

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
            Join MannyMap
          </h2>
          <p className="text-center text-muted-foreground text-sm">
            Sign in to sync your ratings across devices and unlock more features
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
              <p className="font-display font-semibold text-foreground mb-1">Sync Across Devices</p>
              <p className="text-sm text-muted-foreground">
                Your ratings follow you — sign in from any device
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={signing}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {signing ? (
              "Signing in..."
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-muted-foreground font-display font-medium text-sm hover:text-foreground hover:bg-surface transition-colors"
          >
            Maybe later
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            Continue rating anonymously or sign in to sync across devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
