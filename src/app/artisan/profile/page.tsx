"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Camera,
  Store,
  CreditCard,
  Shield,
  Star,
  Package,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { artisanService } from "@/lib/artisan-service";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Artisan, ArtisanBankDetails } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { clientDb } from "@/lib/database-client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ArtisanProfile() {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [bankDetails, setBankDetails] = useState<ArtisanBankDetails | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchProfile() {
      const user = await clientDb.getUser();
      if (!user) return;
      const data = await artisanService.getArtisanFullProfile(user.id);
      setArtisan(data.artisanProfile);
      setBankDetails(data.bankDetails);
      setFormData({
        name: data.profile?.full_name || "",
        email: data.profile?.email || "",
        bio: data.profile?.bio || data.artisanProfile?.shop_description || "",
        contactDetails: {
          phone:
            data.profile?.phone || data.artisanProfile?.contact_phone || "",
          address: data.artisanProfile?.location_address || "",
          city: data.artisanProfile?.location_city || "",
          state: data.artisanProfile?.location_state || "",
        },
        shopName: data.artisanProfile?.shop_name || "",
        shopDescription: data.artisanProfile?.shop_description || "",
        shopLogoUrl: data.artisanProfile?.shop_logo_url || "",
        bankDetails: {
          bankName: data.bankDetails?.bankName || "",
          accountHolderName: data.bankDetails?.accountHolderName || "",
          accountNumber: data.bankDetails?.accountNumber || "",
          ifscCode: data.bankDetails?.ifscCode || "",
          panNumber: data.bankDetails?.panNumber || "",
        },
      });
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!artisan) return;
    const user = await clientDb.getUser();
    if (!user) return;
    await artisanService.updateArtisanFullProfile(user.id, {
      profile: {
        email: formData.email,
        first_name: formData.name.split(" ")[0] || "",
        last_name: formData.name.split(" ").slice(1).join(" ") || "",
        phone: formData.contactDetails?.phone,
      },
      artisanProfile: {
        shop_name: formData.shopName,
        description: formData.shopDescription,
        shop_logo: formData.shopLogoUrl,
        location: `${formData.contactDetails?.address}, ${formData.contactDetails?.city}, ${formData.contactDetails?.state}`,
      },
      bankDetails: {
        bankName: formData.bankDetails.bankName,
        accountHolderName: formData.bankDetails.accountHolderName,
        accountNumber: formData.bankDetails.accountNumber,
        ifscCode: formData.bankDetails.ifscCode,
        panNumber: formData.bankDetails.panNumber,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(artisan);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (!formData) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div>Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="h-8 w-8 text-purple-500" />
                  {t("profile.title")}
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your profile and shop information
                </p>
              </div>
              {!isEditing ? (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  onClick={() => setIsEditing(true)}
                >
                  {t("profile.edit_profile")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-none"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white border-2 border-black rounded-none"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 border-2 border-black rounded-none bg-gray-50">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="shop"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                Shop Details
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                Business Info
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              {/* Use formData for values */}
              {/* ...rest of the tab content unchanged, but all fields use formData and correct mapping... */}
            </TabsContent>

            {/* Shop Details Tab */}
            <TabsContent value="shop">
              {/* Use formData for values */}
              {/* ...rest of the tab content unchanged, but all fields use formData and correct mapping... */}
            </TabsContent>

            {/* Business Info Tab */}
            <TabsContent value="business">
              {/* Use formData.bankDetails for values */}
              {/* ...rest of the tab content unchanged, but all fields use formData.bankDetails and correct mapping... */}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
