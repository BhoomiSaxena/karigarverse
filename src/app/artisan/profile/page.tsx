"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  AlertCircle,
  Award,
  Briefcase,
  Building,
  Calendar,
  Camera,
  Clock,
  CreditCard,
  Edit2,
  Eye,
  FileText,
  Globe,
  Home,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Upload,
  User,
  Utensils,
  X,
} from "lucide-react";
import { clientDb } from "@/lib/database-client";
import { Database, ArtisanProfileData } from "@/lib/database.types";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";

type BusinessHours = {
  [day: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
};

type ArtisanProfileUpdate = Partial<ArtisanProfileData>;

const initialProfileData: Partial<ArtisanProfileData> = {
  shop_name: "My Shop", // Default shop name to avoid NOT NULL constraint
  description: null,
  shop_logo: null,
  banner_image: null,
  specialties: [],
  location: null,
  phone: null,
  email: null,
  website: null,
  established_year: null,
  experience_years: null,
  social_media: null,
  business_license: null,
  business_hours: {
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "14:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: true },
  },
  portfolio_images: [],
  certificates: [],
  awards: [],
  delivery_info: null,
  payment_methods: [],
  return_policy: null,
  shipping_policy: null,
  preferred_language: null,
  notification_preferences: null,
};

// Specialty categories with icons
const specialtyCategories = [
  { id: "pottery", name: "pottery", icon: Palette },
  { id: "textiles", name: "textiles", icon: Utensils },
  { id: "jewelry", name: "jewelry", icon: Star },
  { id: "woodwork", name: "woodwork", icon: Building },
  { id: "metalwork", name: "metalwork", icon: Shield },
  { id: "painting", name: "painting", icon: Palette },
  { id: "sculpture", name: "sculpture", icon: Award },
  { id: "ceramics", name: "ceramics", icon: Camera },
  { id: "glasswork", name: "glasswork", icon: Eye },
  { id: "leatherwork", name: "leatherwork", icon: ShoppingBag },
];

// Business hours template
const businessDays = [
  { key: "monday", name: "monday" },
  { key: "tuesday", name: "tuesday" },
  { key: "wednesday", name: "wednesday" },
  { key: "thursday", name: "thursday" },
  { key: "friday", name: "friday" },
  { key: "saturday", name: "saturday" },
  { key: "sunday", name: "sunday" },
];

// Languages
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
];

// Payment methods
const paymentMethodOptions = [
  "Cash on Delivery",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "PayPal",
  "Bank Transfer",
];

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
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ArtisanProfilePage() {
  const { user, profile, artisanProfile, loading, refreshProfile } =
    useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState<ArtisanProfileData>({
    id: "",
    user_id: "",
    shop_name: initialProfileData.shop_name || "My Shop",
    description: initialProfileData.description,
    specialties: initialProfileData.specialties || [],
    location: initialProfileData.location,
    business_license: initialProfileData.business_license,
    verification_status: "pending",
    status: "active",
    commission_rate: 10.0,
    total_sales: 0.0,
    total_orders: 0,
    rating: null,
    banner_image: initialProfileData.banner_image,
    shop_logo: initialProfileData.shop_logo,
    created_at: "",
    updated_at: "",
    phone: initialProfileData.phone,
    email: initialProfileData.email,
    website: initialProfileData.website,
    established_year: initialProfileData.established_year,
    experience_years: initialProfileData.experience_years,
    social_media: initialProfileData.social_media,
    business_hours: initialProfileData.business_hours,
    portfolio_images: initialProfileData.portfolio_images || [],
    certificates: initialProfileData.certificates || [],
    awards: initialProfileData.awards || [],
    delivery_info: initialProfileData.delivery_info,
    payment_methods: initialProfileData.payment_methods || [],
    return_policy: initialProfileData.return_policy,
    shipping_policy: initialProfileData.shipping_policy,
    preferred_language: initialProfileData.preferred_language,
    notification_preferences: initialProfileData.notification_preferences,
  } as ArtisanProfileData);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (artisanProfile) {
      setProfileData(artisanProfile as ArtisanProfileData);
    }
  }, [artisanProfile]);

  // Handle photo upload
  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "shop_logo" | "banner_image"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("artisan_profile.invalid_file_type"),
        description: t("artisan_profile.invalid_file_type_desc"),
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("artisan_profile.file_too_large"),
        description: t("artisan_profile.file_too_large_desc"),
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;

          // Update state
          setProfileData((prev) => ({ ...prev, [fieldName]: base64String }));

          // Update database
          await clientDb.updateArtisanProfile(user.id, {
            [fieldName]: base64String,
          });

          await refreshProfile();
          toast({
            title: t("artisan_profile.success"),
            description: t("artisan_profile.photo_updated"),
          });
        } catch (error) {
          console.error("Error saving photo:", error);
          toast({
            title: t("artisan_profile.error"),
            description: t("artisan_profile.failed_to_save_photo"),
            variant: "destructive",
          });
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: t("artisan_profile.error"),
        description: t("artisan_profile.failed_to_upload_photo"),
        variant: "destructive",
      });
      setUploadingPhoto(false);
    }
  };

  // Handle form save
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Extract only the fields relevant to artisan_profiles table
      const artisanProfileUpdates = { ...profileData };
      console.log(
        "Attempting to save profile with data:",
        artisanProfileUpdates
      );

      await clientDb.updateArtisanProfile(user.id, artisanProfileUpdates);

      await refreshProfile();
      setIsEditing(false);
      toast({
        title: t("artisan_profile.success"),
        description: t("artisan_profile.profile_updated"),
      });
    } catch (error) {
      console.error("Error updating artisan profile:", error);
      toast({
        title: t("artisan_profile.error"),
        description: t("artisan_profile.failed_to_update_profile"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle nested field updates
  const updateNestedField = (
    section: keyof typeof profileData,
    field: string,
    value: any
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  // Handle array field updates (add/remove)
  const handleArrayChange = (
    field: "specialties" | "payment_methods",
    value: string
  ) => {
    setProfileData((prev) => {
      const currentValues = (prev[field] as string[] | null) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  // Toggle specialty selection
  const toggleSpecialty = (specialtyId: string) => {
    handleArrayChange("specialties", specialtyId);
  };

  // Handle portfolio image changes
  const handlePortfolioImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileData((prev) => {
          const newImages = [...(prev.portfolio_images || [])];
          newImages[index] = base64String;
          return { ...prev, portfolio_images: newImages };
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading portfolio image:", error);
      toast({
        title: t("artisan_profile.error"),
        description: t("artisan_profile.failed_to_upload_photo"),
        variant: "destructive",
      });
    }
  };

  // Add new portfolio image
  const handleAddPortfolioImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setProfileData((prev) => ({
            ...prev,
            portfolio_images: [...(prev.portfolio_images || []), base64String],
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error adding portfolio image:", error);
        toast({
          title: t("artisan_profile.error"),
          description: t("artisan_profile.image_added"),
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  // Handle photo upload for shop logo
  const handleShopLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handlePhotoUpload(e, "shop_logo");
  };

  // Handle photo upload for banner image
  const handleBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handlePhotoUpload(e, "banner_image");
  };

  // Remove portfolio image
  const handleImageRemove = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      portfolio_images: (prev.portfolio_images || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">
              {t("artisan_profile.access_denied")}
            </h1>
            <p className="text-gray-600 mb-4">
              {t("artisan_profile.login_required")}
            </p>
            <Button onClick={() => router.push("/login")}>
              {t("artisan_profile.go_to_login")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleShopLogoUpload}
        accept="image/*"
        className="hidden"
      />

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
                  <Store className="h-8 w-8 text-purple-500" />
                  {t("artisan_profile.title")}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t("artisan_profile.subtitle")}
                </p>
              </div>
              {!isEditing ? (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("artisan_profile.edit_profile")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-none"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("artisan_profile.cancel")}
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white border-2 border-black rounded-none"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving
                      ? t("artisan_profile.saving")
                      : t("artisan_profile.save_changes")}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 p-12 rounded-2xl border-2 border-black mb-10 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row items-start gap-10 w-full">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full border-4 border-black shadow-xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
                        {profile?.first_name?.[0]}
                        {profile?.last_name?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Button */}
                  <button
                    onClick={() => router.push("/profile")}
                    className="absolute -bottom-3 -right-3 p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-2 text-center">
                  {t("artisan_profile.edit_personal_photo")}
                </p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <h1 className="text-5xl font-bold mb-4 text-gray-900">
                    {profileData.shop_name || t("artisan_profile.your_shop")}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    {t("artisan_profile.managed_by")} {profile?.first_name}{" "}
                    {profile?.last_name}
                  </p>

                  {profileData.description && (
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        {t("artisan_profile.about_the_shop")}
                      </h2>
                      <p className="text-gray-700">{profileData.description}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {profileData.specialties?.map((specialty) => {
                      const specialtyData = specialtyCategories.find(
                        (s) => s.id === specialty
                      );
                      return specialtyData ? (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="border-2 border-gray-300 text-gray-700"
                        >
                          {t(`category.${specialtyData.name}`)}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Mail className="h-5 w-5" />
                      {t("artisan_profile.email_address")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="border-2 border-gray-300 rounded-none"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Phone className="h-5 w-5" />
                      {t("artisan_profile.phone_number")}
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="border-2 border-gray-300 rounded-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2 font-medium"
                    >
                      <MapPin className="h-5 w-5" />
                      Location / City
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Jaipur, Rajasthan"
                      value={profileData.location || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="border-2 border-gray-300 rounded-none"
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="established_year"
                      className="flex items-center gap-2 font-medium"
                    >
                      <Calendar className="h-5 w-5" />
                      Established Year
                    </Label>
                    <Input
                      id="established_year"
                      type="number"
                      placeholder="e.g., 2010"
                      value={profileData.established_year || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          established_year: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        }))
                      }
                      disabled={!isEditing}
                      className="border-2 border-gray-300 rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Tabs */}
          <Tabs defaultValue="shop" className="space-y-8">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-white border-2 border-black rounded-2xl p-2 gap-1 shadow-lg">
              <TabsTrigger
                value="shop"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:rounded-xl transition-all border-0"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("artisan_profile.shop_info")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:rounded-xl transition-all border-0"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("artisan_profile.portfolio")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:rounded-xl transition-all border-0"
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("artisan_profile.business")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:rounded-xl transition-all border-0"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("artisan_profile.policies")}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Shop Information Tab */}
            <TabsContent value="shop" className="space-y-8">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Store className="h-6 w-6" />
                        {t("artisan_profile.shop_details")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="shop_name"
                          className="flex items-center gap-3 text-base font-medium"
                        >
                          <Store className="h-5 w-5" />
                          {t("artisan_profile.shop_name")}
                        </Label>
                        <Input
                          id="shop_name"
                          value={profileData.shop_name || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              shop_name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder={t(
                            "artisan_profile.shop_name_placeholder"
                          )}
                          className="border-2 border-gray-300 rounded-none"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="description"
                          className="flex items-center gap-3 text-base font-medium"
                        >
                          <FileText className="h-5 w-5" />
                          {t("artisan_profile.shop_description")}
                        </Label>
                        <Textarea
                          id="description"
                          value={profileData.description || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder={t(
                            "artisan_profile.shop_description_placeholder"
                          )}
                          className="border-2 border-gray-300 rounded-none min-h-[120px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <Phone className="h-5 w-5" />
                            {t("artisan_profile.phone_number")}
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="contact_email"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <Mail className="h-5 w-5" />
                            {t("artisan_profile.email_address")}
                          </Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={profileData.contact_email || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                contact_email: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="website"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <Globe className="h-5 w-5" />
                            {t("artisan_profile.website_url")}
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            value={profileData.website || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                website: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            placeholder={t(
                              "artisan_profile.website_url_placeholder"
                            )}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="location"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <MapPin className="h-5 w-5" />
                            {t("artisan_profile.location_city")}
                          </Label>
                          <Input
                            id="location"
                            placeholder={t(
                              "artisan_profile.location_placeholder"
                            )}
                            value={profileData.location || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="established_year"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <Calendar className="h-5 w-5" />
                            {t("artisan_profile.established_year")}
                          </Label>
                          <Input
                            id="established_year"
                            type="number"
                            placeholder={t(
                              "artisan_profile.established_year_placeholder"
                            )}
                            value={profileData.established_year || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                established_year: e.target.value
                                  ? parseInt(e.target.value)
                                  : null,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="experience_years"
                            className="flex items-center gap-3 text-base font-medium"
                          >
                            <Star className="h-5 w-5" />
                            {t("artisan_profile.experience_years")}
                          </Label>
                          <Input
                            id="experience_years"
                            type="number"
                            placeholder={t(
                              "artisan_profile.experience_years_placeholder"
                            )}
                            value={profileData.experience_years || ""}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                experience_years: e.target.value
                                  ? parseInt(e.target.value)
                                  : null,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specialties */}
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        {t("artisan_profile.specialties")}
                      </CardTitle>
                      <CardDescription>
                        {t("artisan_profile.specialties_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {specialtyCategories.map((specialty) => {
                          const IconComponent = specialty.icon;
                          const isSelected = (
                            profileData.specialties || []
                          ).includes(specialty.id);

                          return (
                            <button
                              key={specialty.id}
                              type="button"
                              disabled={!isEditing}
                              onClick={() => toggleSpecialty(specialty.id)}
                              className={`p-3 border-2 rounded-none transition-colors text-center ${
                                isSelected
                                  ? "border-orange-500 bg-orange-100 text-orange-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              <IconComponent className="h-6 w-6 mx-auto mb-2" />
                              <span className="text-xs font-medium">
                                {t(`category.${specialty.name}`)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {(profileData.specialties || []).length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Selected specialties:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(profileData.specialties || []).map(
                              (specialtyId) => {
                                const specialty = specialtyCategories.find(
                                  (s) => s.id === specialtyId
                                );
                                return specialty ? (
                                  <Badge
                                    key={specialtyId}
                                    variant="secondary"
                                    className="border-2 border-orange-300 bg-orange-100 text-orange-700"
                                  >
                                    {specialty.name}
                                  </Badge>
                                ) : null;
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shop Images */}
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        {t("artisan_profile.shop_images")}
                      </CardTitle>
                      <CardDescription>
                        {t("artisan_profile.shop_images_desc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-lg font-semibold mb-4 block">
                            {t("artisan_profile.shop_logo")}
                          </Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-2 border-black">
                              <AvatarImage
                                src={profileData.shop_logo || undefined}
                                alt="Shop Logo"
                              />
                              <AvatarFallback>
                                <Store />
                              </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-2 border-black rounded-none"
                                onClick={() =>
                                  document
                                    .getElementById("shop-logo-input")
                                    ?.click()
                                }
                                disabled={isUploadingPhoto}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {t("artisan_profile.upload_logo")}
                              </Button>
                            )}
                            <input
                              id="shop-logo-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handlePhotoUpload(e, "shop_logo")
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-lg font-semibold mb-4 block">
                            {t("artisan_profile.banner_image")}
                          </Label>
                          <div className="aspect-video w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                            {profileData.banner_image ? (
                              <Image
                                src={profileData.banner_image}
                                alt="Shop Banner"
                                layout="fill"
                                objectFit="cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <Camera className="h-8 w-8" />
                              </div>
                            )}
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute bottom-4 right-4 border-2 border-black rounded-none"
                                onClick={() =>
                                  document
                                    .getElementById("banner-image-input")
                                    ?.click()
                                }
                                disabled={isUploadingPhoto}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {t("artisan_profile.upload_banner")}
                              </Button>
                            )}
                            <input
                              id="banner-image-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handlePhotoUpload(e, "banner_image")
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-8">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Portfolio Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(profileData.portfolio_images || []).map(
                          (img: string, index: number) => (
                            <div key={index} className="relative group">
                              <Image
                                src={img}
                                alt={`Portfolio image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                width={200}
                                height={200}
                              />
                              {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black rounded-none"
                                    onClick={() => handleImageRemove(index)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    {t("artisan_profile.remove")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-black rounded-none"
                                    onClick={() =>
                                      document
                                        .getElementById(
                                          `portfolio-input-${index}`
                                        )
                                        ?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Change Image
                                  </Button>
                                </div>
                              )}
                              <input
                                id={`portfolio-input-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handlePortfolioImageChange(e, index)
                                }
                              />
                            </div>
                          )
                        )}
                      </div>

                      {isEditing && (
                        <Button
                          variant="outline"
                          className="mt-4 border-2 border-black rounded-none"
                          onClick={handleAddPortfolioImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Image
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t("artisan_profile.certificates_awards")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="certificates"
                            className="text-lg font-semibold mb-4 block"
                          >
                            {t("artisan_profile.certificates")}
                          </Label>
                          <Input
                            id="certificates"
                            placeholder={t(
                              "artisan_profile.certificates_placeholder"
                            )}
                            disabled={!isEditing}
                            value={(profileData.certificates || []).join(", ")}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                certificates: e.target.value
                                  ? e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                  : [],
                              }))
                            }
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="awards"
                            className="text-lg font-semibold mb-4 block"
                          >
                            {t("artisan_profile.awards")}
                          </Label>
                          <Input
                            id="awards"
                            placeholder={t(
                              "artisan_profile.awards_placeholder"
                            )}
                            disabled={!isEditing}
                            value={(profileData.awards || []).join(", ")}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                awards: e.target.value
                                  ? e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                  : [],
                              }))
                            }
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-8">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="business_license"
                          className="flex items-center gap-3 text-base font-medium"
                        >
                          <ShieldCheck className="h-5 w-5" />
                          Business License Number
                        </Label>
                        <Input
                          id="business_license"
                          value={profileData.business_license || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              business_license: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t("artisan_profile.business_hours")}
                      </CardTitle>
                      <CardDescription>
                        Set your working hours so customers know when you're
                        available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(profileData.business_hours || {}).map(
                          ([day, hours]) => (
                            <div key={day} className="flex items-center gap-4">
                              <div className="w-20 text-sm font-medium">
                                {t(`artisan_profile.${day}`)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!(hours as any)?.closed}
                                  onCheckedChange={(checked) => {
                                    const updatedHours = {
                                      ...((profileData.business_hours as BusinessHours) ||
                                        {}),
                                    };
                                    updatedHours[day] = {
                                      ...(hours as any),
                                      closed: !checked,
                                    };
                                    setProfileData((prev) => ({
                                      ...prev,
                                      business_hours: updatedHours,
                                    }));
                                  }}
                                  disabled={!isEditing}
                                />
                                {!(hours as any)?.closed && (
                                  <>
                                    <Input
                                      type="time"
                                      value={(hours as any)?.open || "09:00"}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...((profileData.business_hours as BusinessHours) ||
                                            {}),
                                        };
                                        updatedHours[day] = {
                                          ...(hours as any),
                                          open: e.target.value,
                                        };
                                        setProfileData((prev) => ({
                                          ...prev,
                                          business_hours: updatedHours,
                                        }));
                                      }}
                                      disabled={!isEditing}
                                      className="w-32 border-2 border-gray-300 rounded-none text-sm"
                                    />
                                    <span className="text-sm text-gray-500">
                                      to
                                    </span>
                                    <Input
                                      type="time"
                                      value={(hours as any)?.close || "17:00"}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...((profileData.business_hours as BusinessHours) ||
                                            {}),
                                        };
                                        updatedHours[day] = {
                                          ...(hours as any),
                                          close: e.target.value,
                                        };
                                        setProfileData((prev) => ({
                                          ...prev,
                                          business_hours: updatedHours,
                                        }));
                                      }}
                                      disabled={!isEditing}
                                      className="w-32 border-2 border-gray-300 rounded-none text-sm"
                                    />
                                  </>
                                )}
                                {(hours as any)?.closed && (
                                  <span className="text-sm text-gray-500">
                                    Closed
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-8">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t("artisan_profile.shipping_policy")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label
                          htmlFor="shipping_policy"
                          className="text-lg font-semibold mb-4 block"
                        >
                          {t("artisan_profile.shipping_policy")}
                        </Label>
                        <Textarea
                          id="shipping_policy"
                          value={profileData.shipping_policy || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              shipping_policy: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder={t(
                            "artisan_profile.shipping_policy_placeholder"
                          )}
                          className="border-2 border-gray-300 rounded-none min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-2 border-black rounded-2xl shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t("artisan_profile.return_policy")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label
                          htmlFor="return_policy"
                          className="text-lg font-semibold mb-4 block"
                        >
                          {t("artisan_profile.return_policy")}
                        </Label>
                        <Textarea
                          id="return_policy"
                          value={profileData.return_policy || ""}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              return_policy: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder={t(
                            "artisan_profile.return_policy_placeholder"
                          )}
                          className="border-2 border-gray-300 rounded-none min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
