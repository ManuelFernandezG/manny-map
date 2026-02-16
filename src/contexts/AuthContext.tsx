import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const MIGRATION_KEY = "mannymap_auth_migrated";

async function migrateAnonymousRatings(newUid: string) {
  // Only migrate once
  if (localStorage.getItem(MIGRATION_KEY) === newUid) return;

  const oldUserId = localStorage.getItem("mannymap_user_id");
  if (!oldUserId || oldUserId === newUid) {
    localStorage.setItem(MIGRATION_KEY, newUid);
    return;
  }

  try {
    // Find all rated location IDs from localStorage
    const raw = localStorage.getItem("mannymap_rated_locations");
    if (!raw) {
      localStorage.setItem(MIGRATION_KEY, newUid);
      return;
    }
    const parsed = JSON.parse(raw);
    const locationIds = Array.isArray(parsed) ? parsed : Object.keys(parsed);

    if (locationIds.length === 0) {
      localStorage.setItem(MIGRATION_KEY, newUid);
      return;
    }

    // Batch update each location's ratings from old userId to new UID
    for (const locationId of locationIds) {
      const ratingsRef = collection(db, `locations/${locationId}/ratings`);
      const q = query(ratingsRef, where("userId", "==", oldUserId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => {
          batch.update(d.ref, { userId: newUid });
        });
        await batch.commit();
      }
    }

    // Clear old anonymous ID
    localStorage.removeItem("mannymap_user_id");
    localStorage.setItem(MIGRATION_KEY, newUid);
  } catch (err) {
    console.error("Rating migration failed:", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await migrateAnonymousRatings(firebaseUser.uid);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
