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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
  Edit2,
  Save,
  X,
  Upload,
  Loader2,
  Globe,
  Briefcase,
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Languages,
  Clock,
  Eye,
  FileText,
  Home,
  Building,
  Award,
  ShoppingBag,
  Truck,
  Palette,
  Music,
  BookOpen,
  Mountain,
  Plane,
  Camera as CameraIcon,
  Utensils,
  Dumbbell,
  Smartphone,
  Gamepad2,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
} from "lucide-react";
import { artisanService } from "@/lib/artisan-service";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Artisan, ArtisanBankDetails } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { clientDb } from "@/lib/database-client";
import { createClient } from "@/utils/supabase/client";

type ArtisanProfileData = {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  bio: string;
  avatar_url?: string;

  // Shop Information
  shop_name: string;
  description: string;
  shop_logo?: string;
  banner_image?: string;
  specialties: string[];
  location: string;
  contact_phone: string;
  contact_email: string;
  website_url: string;
  established_year: number | null;
  experience_years: number | null;

  // Address
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };

  // Social Media
  social_media: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  // Business Information
  business_license: string;
  business_hours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };

  // Portfolio & Certifications
  portfolio_images: string[];
  certificates: string[];
  awards: string[];

  // Delivery & Payment
  delivery_info: {
    delivery_time?: string;
    shipping_charges?: string;
    free_shipping_above?: number;
    delivery_areas?: string[];
  };
  payment_methods: string[];
  return_policy: string;
  shipping_policy: string;

  // Preferences
  preferred_language: string;
  notification_preferences: {
    order_notifications?: boolean;
    review_notifications?: boolean;
    marketing_emails?: boolean;
    sms_notifications?: boolean;
  };

  // Bank Details
  bank_details: {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    pan_number: string;
  };
};

// Specialty categories with icons
const specialtyCategories = [
  { id: "pottery", name: "Pottery", icon: Palette },
  { id: "textiles", name: "Textiles", icon: Utensils },
  { id: "jewelry", name: "Jewelry", icon: Star },
  { id: "woodwork", name: "Woodwork", icon: Building },
  { id: "metalwork", name: "Metalwork", icon: Shield },
  { id: "painting", name: "Painting", icon: Palette },
  { id: "sculpture", name: "Sculpture", icon: Award },
  { id: "ceramics", name: "Ceramics", icon: CameraIcon },
  { id: "glasswork", name: "Glasswork", icon: Eye },
  { id: "leatherwork", name: "Leatherwork", icon: ShoppingBag },
];

// Business hours template
const businessDays = [
  { key: "monday", name: "Monday" },
  { key: "tuesday", name: "Tuesday" },
  { key: "wednesday", name: "Wednesday" },
  { key: "thursday", name: "Thursday" },
  { key: "friday", name: "Friday" },
  { key: "saturday", name: "Saturday" },
  { key: "sunday", name: "Sunday" },
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
  visible: { opacity: 1, y: 0 },
};

export default function ArtisanProfilePage() {
  const { user, profile, loading, refreshProfile } = useDatabase();
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);
  const [profileData, setProfileData] = useState<ArtisanProfileData>({
    // Personal Information
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    bio: "",
    avatar_url: "",

    // Shop Information
    shop_name: "",
    description: "",
    shop_logo: "",
    banner_image: "",
    specialties: [],
    location: "",
    contact_phone: "",
    contact_email: "",
    website_url: "",
    established_year: null,
    experience_years: null,

    // Address
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },

    // Social Media
    social_media: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },

    // Business Information
    business_license: "",
    business_hours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    },

    // Portfolio & Certifications
    portfolio_images: [],
    certificates: [],
    awards: [],

    // Delivery & Payment
    delivery_info: {
      delivery_time: "3-5 business days",
      shipping_charges: "Free shipping above ₹500",
      free_shipping_above: 500,
      delivery_areas: [],
    },
    payment_methods: ["Cash on Delivery", "UPI"],
    return_policy: "",
    shipping_policy: "",

    // Preferences
    preferred_language: "en",
    notification_preferences: {
      order_notifications: true,
      review_notifications: true,
      marketing_emails: false,
      sms_notifications: false,
    },

    // Bank Details
    bank_details: {
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      ifsc_code: "",
      pan_number: "",
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
  }, [user, loading, router]);

  // Load artisan profile data when user changes
  useEffect(() => {
    if (user && profile) {
      loadArtisanProfile();
    }
  }, [user, profile]);

  const loadArtisanProfile = async () => {
    try {
      if (!user) return;

      // Get artisan profile
      const artisan = await clientDb.getArtisanProfile(user.id);
      setArtisanProfile(artisan);

      // Get bank details
      const bankDetails = await clientDb.getArtisanBankDetails(user.id);

      // Map data to state
      setProfileData({
        // Personal Information from profile
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        date_of_birth: profile?.date_of_birth || "",
        bio: (profile as any)?.bio || "",
        avatar_url: profile?.avatar_url || "",

        // Shop Information from artisan profile
        shop_name: artisan?.shop_name || "",
        description: artisan?.description || "",
        shop_logo: artisan?.shop_logo || "",
        banner_image: artisan?.banner_image || "",
        specialties: artisan?.specialties || [],
        location: artisan?.location || "",
        contact_phone: artisan?.contact_phone || "",
        contact_email: artisan?.contact_email || "",
        website_url: artisan?.website_url || "",
        established_year: artisan?.established_year || null,
        experience_years: artisan?.experience_years || null,

        // Address
        address:
          typeof (profile as any)?.address === "object" &&
          (profile as any)?.address !== null
            ? (profile as any).address
            : {
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              },

        // Social Media
        social_media:
          typeof artisan?.social_media === "object" &&
          artisan?.social_media !== null
            ? artisan.social_media
            : {
                website: "",
                instagram: "",
                facebook: "",
                twitter: "",
                linkedin: "",
                youtube: "",
              },

        // Business Information
        business_license: artisan?.business_license || "",
        business_hours:
          typeof artisan?.business_hours === "object" &&
          artisan?.business_hours !== null
            ? artisan.business_hours
            : {
                monday: { open: "09:00", close: "17:00", closed: false },
                tuesday: { open: "09:00", close: "17:00", closed: false },
                wednesday: { open: "09:00", close: "17:00", closed: false },
                thursday: { open: "09:00", close: "17:00", closed: false },
                friday: { open: "09:00", close: "17:00", closed: false },
                saturday: { open: "09:00", close: "17:00", closed: false },
                sunday: { open: "09:00", close: "17:00", closed: true },
              },

        // Portfolio & Certifications
        portfolio_images: artisan?.portfolio_images || [],
        certificates: artisan?.certificates || [],
        awards: artisan?.awards || [],

        // Delivery & Payment
        delivery_info:
          typeof artisan?.delivery_info === "object" &&
          artisan?.delivery_info !== null
            ? artisan.delivery_info
            : {
                delivery_time: "3-5 business days",
                shipping_charges: "Free shipping above ₹500",
                free_shipping_above: 500,
                delivery_areas: [],
              },
        payment_methods: artisan?.payment_methods || [
          "Cash on Delivery",
          "UPI",
        ],
        return_policy: artisan?.return_policy || "",
        shipping_policy: artisan?.shipping_policy || "",

        // Preferences
        preferred_language: artisan?.preferred_language || "en",
        notification_preferences:
          typeof artisan?.notification_preferences === "object" &&
          artisan?.notification_preferences !== null
            ? artisan.notification_preferences
            : {
                order_notifications: true,
                review_notifications: true,
                marketing_emails: false,
                sms_notifications: false,
              },

        // Bank Details
        bank_details: bankDetails
          ? {
              bank_name: bankDetails.bankName || "",
              account_holder_name: bankDetails.accountHolderName || "",
              account_number: bankDetails.accountNumber || "",
              ifsc_code: bankDetails.ifscCode || "",
              pan_number: bankDetails.panNumber || "",
            }
          : {
              bank_name: "",
              account_holder_name: "",
              account_number: "",
              ifsc_code: "",
              pan_number: "",
            },
      });
    } catch (error) {
      console.error("Error loading artisan profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Convert to base64 for demo (in production, use Supabase storage)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Update profile data
        setProfileData((prev) => ({
          ...prev,
          avatar_url: base64String,
        }));

        // Save to database
        await clientDb.updateUserProfile(user.id, {
          avatar_url: base64String,
        });

        await refreshProfile();

        toast({
          title: "Photo updated",
          description: "Your profile photo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle saving profile data
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Update user profile
      await clientDb.updateUserProfile(user.id, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        address: profileData.address,
      });

      // Update artisan profile
      if (artisanProfile) {
        await clientDb.updateArtisanProfile(user.id, {
          shop_name: profileData.shop_name,
          description: profileData.description,
          shop_logo: profileData.shop_logo,
          banner_image: profileData.banner_image,
          specialties: profileData.specialties,
          location: profileData.location,
          contact_phone: profileData.contact_phone,
          contact_email: profileData.contact_email,
          website_url: profileData.website_url,
          established_year: profileData.established_year,
          experience_years: profileData.experience_years,
          social_media: profileData.social_media,
          business_license: profileData.business_license,
          business_hours: profileData.business_hours,
          portfolio_images: profileData.portfolio_images,
          certificates: profileData.certificates,
          awards: profileData.awards,
          delivery_info: profileData.delivery_info,
          payment_methods: profileData.payment_methods,
          return_policy: profileData.return_policy,
          shipping_policy: profileData.shipping_policy,
          preferred_language: profileData.preferred_language,
          notification_preferences: profileData.notification_preferences,
        });
      } else {
        // Create artisan profile if it doesn't exist
        await clientDb.createArtisanProfile({
          user_id: user.id,
          shop_name: profileData.shop_name,
          description: profileData.description,
          shop_logo: profileData.shop_logo,
          banner_image: profileData.banner_image,
          specialties: profileData.specialties,
          location: profileData.location,
          contact_phone: profileData.contact_phone,
          contact_email: profileData.contact_email,
          website_url: profileData.website_url,
          established_year: profileData.established_year,
          experience_years: profileData.experience_years,
          social_media: profileData.social_media,
          business_license: profileData.business_license,
          business_hours: profileData.business_hours,
          portfolio_images: profileData.portfolio_images,
          certificates: profileData.certificates,
          awards: profileData.awards,
          delivery_info: profileData.delivery_info,
          payment_methods: profileData.payment_methods,
          return_policy: profileData.return_policy,
          shipping_policy: profileData.shipping_policy,
          preferred_language: profileData.preferred_language,
          notification_preferences: profileData.notification_preferences,
        });
      }

      // Update bank details
      await clientDb.upsertArtisanBankDetails(user.id, {
        bankName: profileData.bank_details.bank_name,
        accountHolderName: profileData.bank_details.account_holder_name,
        accountNumber: profileData.bank_details.account_number,
        ifscCode: profileData.bank_details.ifsc_code,
        panNumber: profileData.bank_details.pan_number,
      });

      await refreshProfile();
      setIsEditing(false);

      toast({
        title: "Profile saved",
        description: "Your artisan profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save failed",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes with nested field support
  const updateNestedField = (section: string, field: string, value: any) => {
    setProfileData((prev) => {
      const sectionData = prev[section as keyof ArtisanProfileData];
      if (typeof sectionData === "object" && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  // Handle specialty toggle
  const toggleSpecialty = (specialtyId: string) => {
    setProfileData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter((s) => s !== specialtyId)
        : [...prev.specialties, specialtyId],
    }));
  };

  // Handle payment method toggle
  const togglePaymentMethod = (method: string) => {
    setProfileData((prev) => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter((m) => m !== method)
        : [...prev.payment_methods, method],
    }));
  };

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading your profile...</p>
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
        onChange={handlePhotoUpload}
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
                  Artisan Profile
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your shop and professional information
                </p>
              </div>
              {!isEditing ? (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
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
                    Cancel
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
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 border-2 border-black rounded-none bg-gray-50">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger
                value="shop"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <Store className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Shop</span>
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <Globe className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <Briefcase className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <Truck className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Delivery</span>
              </TabsTrigger>
              <TabsTrigger
                value="banking"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none text-xs md:text-sm"
              >
                <CreditCard className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Banking</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Profile Photo Section */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Profile Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-2 border-black rounded-none">
                            <AvatarImage src={profileData.avatar_url} />
                            <AvatarFallback className="text-lg bg-orange-100">
                              {profileData.first_name.charAt(0)}
                              {profileData.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isUploadingPhoto && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-none">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-3">
                            Upload a professional photo for your artisan
                            profile. This will be displayed on your shop page
                            and products.
                          </p>
                          <Button
                            variant="outline"
                            className="border-2 border-black rounded-none"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Basic Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={profileData.first_name}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                first_name: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={profileData.last_name}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                last_name: e.target.value,
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
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <MailIcon className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
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
                            className="flex items-center gap-2"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
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

                      <div>
                        <Label
                          htmlFor="date_of_birth"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={profileData.date_of_birth}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              date_of_birth: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio / About Me</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Tell customers about yourself and your craft..."
                          className="border-2 border-gray-300 rounded-none min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Address Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={profileData.address.street}
                          onChange={(e) =>
                            updateNestedField(
                              "address",
                              "street",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profileData.address.city}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "city",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={profileData.address.state}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "state",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={profileData.address.zip}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "zip",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) =>
                            updateNestedField(
                              "address",
                              "country",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Shop Details Tab */}
            <TabsContent value="shop">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Shop Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Shop Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="shop_name">Shop Name *</Label>
                        <Input
                          id="shop_name"
                          value={profileData.shop_name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              shop_name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Your shop or brand name"
                          className="border-2 border-gray-300 rounded-none"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Shop Description</Label>
                        <Textarea
                          id="description"
                          value={profileData.description}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Describe your shop, your craft, and what makes you unique..."
                          className="border-2 border-gray-300 rounded-none min-h-[120px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="contact_phone"
                            className="flex items-center gap-2"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            Shop Contact Phone
                          </Label>
                          <Input
                            id="contact_phone"
                            value={profileData.contact_phone}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                contact_phone: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="contact_email"
                            className="flex items-center gap-2"
                          >
                            <MailIcon className="h-4 w-4" />
                            Shop Contact Email
                          </Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={profileData.contact_email}
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
                            htmlFor="website_url"
                            className="flex items-center gap-2"
                          >
                            <GlobeIcon className="h-4 w-4" />
                            Website URL
                          </Label>
                          <Input
                            id="website_url"
                            type="url"
                            value={profileData.website_url}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                website_url: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            placeholder="https://your-website.com"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            placeholder="City, State, Country"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="established_year">
                            Established Year
                          </Label>
                          <Input
                            id="established_year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
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
                          <Label htmlFor="experience_years">
                            Years of Experience
                          </Label>
                          <Input
                            id="experience_years"
                            type="number"
                            min="0"
                            max="80"
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
                </motion.div>

                {/* Specialties */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Specialties & Crafts
                      </CardTitle>
                      <CardDescription>
                        Select the types of crafts and products you specialize
                        in
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {specialtyCategories.map((specialty) => {
                          const IconComponent = specialty.icon;
                          const isSelected = profileData.specialties.includes(
                            specialty.id
                          );

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
                                {specialty.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {profileData.specialties.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Selected specialties:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {profileData.specialties.map((specialtyId) => {
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
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Shop Images */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Shop Images
                      </CardTitle>
                      <CardDescription>
                        Upload your shop logo and banner image
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Shop Logo</Label>
                          <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-none text-center">
                            {profileData.shop_logo ? (
                              <img
                                src={profileData.shop_logo}
                                alt="Shop Logo"
                                className="h-20 w-20 mx-auto object-cover border-2 border-black"
                              />
                            ) : (
                              <div className="h-20 w-20 mx-auto bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                                <Store className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-2 border-black rounded-none"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload Logo
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Banner Image</Label>
                          <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-none text-center">
                            {profileData.banner_image ? (
                              <img
                                src={profileData.banner_image}
                                alt="Shop Banner"
                                className="h-20 w-full mx-auto object-cover border-2 border-black"
                              />
                            ) : (
                              <div className="h-20 w-full mx-auto bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                                <Mountain className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-2 border-black rounded-none"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload Banner
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Social Media & Online Presence
                      </CardTitle>
                      <CardDescription>
                        Connect your social media accounts to boost your shop's
                        visibility
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="website"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            value={profileData.social_media.website}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "website",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="https://your-website.com"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="instagram"
                            className="flex items-center gap-2"
                          >
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            value={profileData.social_media.instagram}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "instagram",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="@your_instagram_handle"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="facebook"
                            className="flex items-center gap-2"
                          >
                            <Facebook className="h-4 w-4" />
                            Facebook
                          </Label>
                          <Input
                            id="facebook"
                            value={profileData.social_media.facebook}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "facebook",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="Facebook page or profile URL"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="twitter"
                            className="flex items-center gap-2"
                          >
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </Label>
                          <Input
                            id="twitter"
                            value={profileData.social_media.twitter}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "twitter",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="@your_twitter_handle"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="linkedin"
                            className="flex items-center gap-2"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={profileData.social_media.linkedin}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "linkedin",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="LinkedIn profile URL"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="youtube"
                            className="flex items-center gap-2"
                          >
                            <Youtube className="h-4 w-4" />
                            YouTube
                          </Label>
                          <Input
                            id="youtube"
                            value={profileData.social_media.youtube}
                            onChange={(e) =>
                              updateNestedField(
                                "social_media",
                                "youtube",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="YouTube channel URL"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Business Information Tab */}
            <TabsContent value="business">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Business License & Legal */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Business License & Legal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="business_license">
                          Business License Number
                        </Label>
                        <Input
                          id="business_license"
                          value={profileData.business_license}
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
                </motion.div>

                {/* Business Hours */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Business Hours
                      </CardTitle>
                      <CardDescription>
                        Set your working hours so customers know when you're
                        available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {businessDays.map((day) => {
                          const dayData =
                            profileData.business_hours[
                              day.key as keyof typeof profileData.business_hours
                            ];

                          return (
                            <div
                              key={day.key}
                              className="flex items-center gap-4"
                            >
                              <div className="w-20 text-sm font-medium">
                                {day.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!dayData?.closed}
                                  onCheckedChange={(checked) => {
                                    const updatedHours = {
                                      ...profileData.business_hours,
                                    };
                                    updatedHours[
                                      day.key as keyof typeof updatedHours
                                    ] = {
                                      ...dayData,
                                      closed: !checked,
                                    };
                                    setProfileData((prev) => ({
                                      ...prev,
                                      business_hours: updatedHours,
                                    }));
                                  }}
                                  disabled={!isEditing}
                                />
                                {!dayData?.closed && (
                                  <>
                                    <Input
                                      type="time"
                                      value={dayData?.open || "09:00"}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...profileData.business_hours,
                                        };
                                        updatedHours[
                                          day.key as keyof typeof updatedHours
                                        ] = {
                                          ...dayData,
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
                                      value={dayData?.close || "17:00"}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...profileData.business_hours,
                                        };
                                        updatedHours[
                                          day.key as keyof typeof updatedHours
                                        ] = {
                                          ...dayData,
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
                                {dayData?.closed && (
                                  <span className="text-sm text-gray-500">
                                    Closed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Language & Preferences */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Language & Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="preferred_language">
                          Preferred Language
                        </Label>
                        <Select
                          value={profileData.preferred_language}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              preferred_language: value,
                            }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-2 border-gray-300 rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Notification Preferences</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="order_notifications"
                              className="text-sm"
                            >
                              Order Notifications
                            </Label>
                            <Switch
                              id="order_notifications"
                              checked={
                                profileData.notification_preferences
                                  .order_notifications
                              }
                              onCheckedChange={(checked) =>
                                updateNestedField(
                                  "notification_preferences",
                                  "order_notifications",
                                  checked
                                )
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="review_notifications"
                              className="text-sm"
                            >
                              Review Notifications
                            </Label>
                            <Switch
                              id="review_notifications"
                              checked={
                                profileData.notification_preferences
                                  .review_notifications
                              }
                              onCheckedChange={(checked) =>
                                updateNestedField(
                                  "notification_preferences",
                                  "review_notifications",
                                  checked
                                )
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="marketing_emails"
                              className="text-sm"
                            >
                              Marketing Emails
                            </Label>
                            <Switch
                              id="marketing_emails"
                              checked={
                                profileData.notification_preferences
                                  .marketing_emails
                              }
                              onCheckedChange={(checked) =>
                                updateNestedField(
                                  "notification_preferences",
                                  "marketing_emails",
                                  checked
                                )
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="sms_notifications"
                              className="text-sm"
                            >
                              SMS Notifications
                            </Label>
                            <Switch
                              id="sms_notifications"
                              checked={
                                profileData.notification_preferences
                                  .sms_notifications
                              }
                              onCheckedChange={(checked) =>
                                updateNestedField(
                                  "notification_preferences",
                                  "sms_notifications",
                                  checked
                                )
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Delivery & Payment Tab */}
            <TabsContent value="delivery">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Delivery Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery_time">
                            Typical Delivery Time
                          </Label>
                          <Input
                            id="delivery_time"
                            value={profileData.delivery_info.delivery_time}
                            onChange={(e) =>
                              updateNestedField(
                                "delivery_info",
                                "delivery_time",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="e.g., 3-5 business days"
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="free_shipping_above">
                            Free Shipping Above (₹)
                          </Label>
                          <Input
                            id="free_shipping_above"
                            type="number"
                            value={
                              profileData.delivery_info.free_shipping_above ||
                              ""
                            }
                            onChange={(e) =>
                              updateNestedField(
                                "delivery_info",
                                "free_shipping_above",
                                parseInt(e.target.value) || 0
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shipping_charges">
                          Shipping Charges Info
                        </Label>
                        <Input
                          id="shipping_charges"
                          value={profileData.delivery_info.shipping_charges}
                          onChange={(e) =>
                            updateNestedField(
                              "delivery_info",
                              "shipping_charges",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          placeholder="e.g., ₹50 for orders below ₹500"
                          className="border-2 border-gray-300 rounded-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Methods */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                      </CardTitle>
                      <CardDescription>
                        Select the payment methods you accept
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {paymentMethodOptions.map((method) => {
                          const isSelected =
                            profileData.payment_methods.includes(method);

                          return (
                            <button
                              key={method}
                              type="button"
                              disabled={!isEditing}
                              onClick={() => togglePaymentMethod(method)}
                              className={`p-3 border-2 rounded-none transition-colors text-center text-sm ${
                                isSelected
                                  ? "border-green-500 bg-green-100 text-green-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Policies */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="return_policy">Return Policy</Label>
                        <Textarea
                          id="return_policy"
                          value={profileData.return_policy}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              return_policy: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Describe your return and exchange policy..."
                          className="border-2 border-gray-300 rounded-none min-h-[80px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shipping_policy">Shipping Policy</Label>
                        <Textarea
                          id="shipping_policy"
                          value={profileData.shipping_policy}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              shipping_policy: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Describe your shipping policy..."
                          className="border-2 border-gray-300 rounded-none min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Banking Information Tab */}
            <TabsContent value="banking">
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Banking Information
                      </CardTitle>
                      <CardDescription>
                        Secure banking details for payments. This information is
                        encrypted and secure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="bank_name">Bank Name *</Label>
                        <Input
                          id="bank_name"
                          value={profileData.bank_details.bank_name}
                          onChange={(e) =>
                            updateNestedField(
                              "bank_details",
                              "bank_name",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="account_holder_name">
                          Account Holder Name *
                        </Label>
                        <Input
                          id="account_holder_name"
                          value={profileData.bank_details.account_holder_name}
                          onChange={(e) =>
                            updateNestedField(
                              "bank_details",
                              "account_holder_name",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-gray-300 rounded-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="account_number">
                            Account Number *
                          </Label>
                          <Input
                            id="account_number"
                            value={profileData.bank_details.account_number}
                            onChange={(e) =>
                              updateNestedField(
                                "bank_details",
                                "account_number",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ifsc_code">IFSC Code *</Label>
                          <Input
                            id="ifsc_code"
                            value={profileData.bank_details.ifsc_code}
                            onChange={(e) =>
                              updateNestedField(
                                "bank_details",
                                "ifsc_code",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-gray-300 rounded-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pan_number">PAN Number *</Label>
                        <Input
                          id="pan_number"
                          value={profileData.bank_details.pan_number}
                          onChange={(e) =>
                            updateNestedField(
                              "bank_details",
                              "pan_number",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          placeholder="ABCDE1234F"
                          className="border-2 border-gray-300 rounded-none"
                          required
                        />
                      </div>

                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-none">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-blue-900">
                              Secure Information
                            </h4>
                            <p className="text-sm text-blue-700">
                              Your banking information is encrypted and stored
                              securely. We use this information only for
                              processing payments for your orders.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
