"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { clientDb } from "@/lib/database-client-postgres";
import type { Database } from "@/lib/database.types";

// Local user type for our PostgreSQL setup
interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ArtisanProfile = Database["public"]["Tables"]["artisan_profiles"]["Row"];

interface DatabaseContextType {
  user: User | null;
  profile: Profile | null;
  artisanProfile: ArtisanProfile | null;
  loading: boolean;
  isArtisan: boolean;
  refreshProfile: () => Promise<void>;
  createArtisanProfile: (data: {
    shop_name: string;
    description?: string;
    specialties?: string[];
    location?: string;
    business_license?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
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

  const createArtisanProfile = async (data: {
    shop_name: string;
    description?: string;
    specialties?: string[];
    location?: string;
    business_license?: string;
  }) => {
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

  const logout = async () => {
    await clientDb.signOut();
    setUser(null);
    setProfile(null);
    setArtisanProfile(null);
  };

  useEffect(() => {
    // Check for stored authentication token
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Verify token and get user data from API
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            if (userData.user) {
              await refreshProfile();
            }
          } else {
            localStorage.removeItem("auth_token");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          localStorage.removeItem("auth_token");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
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
    logout,
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
