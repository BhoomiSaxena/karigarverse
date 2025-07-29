"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { clientDb } from "@/lib/database-client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ArtisanProfile = Database["public"]["Tables"]["artisan_profiles"]["Row"];

interface DatabaseContextType {
  user: User | null;
  profile: Profile | null;
  artisanProfile: ArtisanProfile | null;
  loading: boolean;
  isArtisan: boolean;
  refreshProfile: () => Promise<void>;
  createArtisanProfile: (
    data: Omit<
      Database["public"]["Tables"]["artisan_profiles"]["Insert"],
      "user_id"
    >
  ) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refreshProfile = async () => {
    if (!user) return;

    try {
      // Get user profile
      const userProfile = await clientDb.getUserProfile(user.id);
      setProfile(userProfile);

      // Check if user has artisan profile
      try {
        const artisan = await clientDb.getArtisanProfile(user.id);
        setArtisanProfile(artisan);
      } catch {
        // User is not an artisan yet
        setArtisanProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const createArtisanProfile = async (
    data: Omit<
      Database["public"]["Tables"]["artisan_profiles"]["Insert"],
      "user_id"
    >
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const artisan = await clientDb.createArtisanProfile({
        ...data,
        user_id: user.id,
      });
      setArtisanProfile(artisan);
    } catch (error) {
      console.error("DatabaseContext - Error creating artisan profile:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorDetails: error,
        userData: { userId: user.id, email: user.email },
        formData: data,
      });
      throw error;
    }
  };

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await refreshProfile();
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile();
      } else {
        setProfile(null);
        setArtisanProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

  const value: DatabaseContextType = {
    user,
    profile,
    artisanProfile,
    loading,
    isArtisan: !!artisanProfile,
    refreshProfile,
    createArtisanProfile,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

export { clientDb };
