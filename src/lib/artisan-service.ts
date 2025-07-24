// src/lib/artisan-service.ts

import { clientDb } from "@/lib/database-client";
import type { Artisan, ArtisanBankDetails } from "@/lib/types";

export const artisanService = {
  // Fetch artisan profile, shop, and bank details from Supabase
  getArtisanFullProfile: async (userId: string) => {
    // Fetch profile
    const profile = await clientDb.getUserProfile(userId);

    // Fetch artisan profile
    const artisanProfile = await clientDb.getArtisanProfile(userId);

    // Fetch bank details
    const bankDetails = await clientDb.getArtisanBankDetails(userId);

    return {
      profile,
      artisanProfile,
      bankDetails: bankDetails || null,
    };
  },

  // Update profile, artisan profile, and bank details
  updateArtisanFullProfile: async (userId: string, updates: {
    profile?: Partial<Artisan>,
    artisanProfile?: Partial<Artisan>,
    bankDetails?: Partial<ArtisanBankDetails>
  }) => {
    let profileRes, artisanRes, bankRes;

    if (updates.profile) {
      profileRes = await clientDb.updateUserProfile(userId, updates.profile);
    }
    if (updates.artisanProfile) {
      artisanRes = await clientDb.updateArtisanProfile(userId, updates.artisanProfile);
    }
    if (updates.bankDetails) {
      bankRes = await clientDb.upsertArtisanBankDetails(userId, updates.bankDetails);
    }

    return {
      profile: profileRes,
      artisanProfile: artisanRes,
      bankDetails: bankRes,
    };
  },
};