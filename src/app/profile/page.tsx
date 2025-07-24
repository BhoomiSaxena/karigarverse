"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clientDb } from "@/lib/database-client";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  ShieldCheck,
  Store,
  Settings,
  Bell,
  CreditCard,
  Star,
  Package,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  Briefcase,
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Users,
  Languages,
  Clock,
  Shield,
  Eye,
  FileText,
  Home,
  Building,
  Palette,
  Gamepad2,
  Music,
  BookOpen,
  Mountain,
  Plane,
  Camera as CameraIcon,
  Utensils,
  ShoppingBag,
  Dumbbell,
  Smartphone,
  Lock,
  Trash2,
} from "lucide-react";

type ProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  bio: string;
  gender: string;
  occupation: string;
  interests: string[];
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  social_media: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  preferences: {
    language?: string;
    currency?: string;
    timezone?: string;
  };
  notification_settings: {
    email_marketing?: boolean;
    email_orders?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
  };
};

// Interest categories with icons
const interestCategories = [
  { id: "art", name: "Art & Crafts", icon: Palette },
  { id: "music", name: "Music", icon: Music },
  { id: "reading", name: "Reading", icon: BookOpen },
  { id: "travel", name: "Travel", icon: Plane },
  { id: "photography", name: "Photography", icon: CameraIcon },
  { id: "cooking", name: "Cooking", icon: Utensils },
  { id: "shopping", name: "Shopping", icon: ShoppingBag },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "technology", name: "Technology", icon: Smartphone },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "outdoors", name: "Outdoors", icon: Mountain },
  { id: "movies", name: "Movies & TV", icon: Eye },
];

// Languages with their names
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

// Currencies
const currencies = [
  { code: "INR", name: "Indian Rupee (₹)" },
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
];

// Timezones
const timezones = [
  { code: "Asia/Kolkata", name: "India Standard Time (IST)" },
  { code: "America/New_York", name: "Eastern Time (ET)" },
  { code: "Europe/London", name: "Greenwich Mean Time (GMT)" },
  { code: "Asia/Tokyo", name: "Japan Standard Time (JST)" },
];

export default function ProfilePage() {
  const { user, profile, artisanProfile, isArtisan, loading, refreshProfile } =
    useDatabase();
  const { t } = useLanguage();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    bio: "",
    gender: "",
    occupation: "",
    interests: [],
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    social_media: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    preferences: {
      language: "en",
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
    notification_settings: {
      email_marketing: true,
      email_orders: true,
      sms_notifications: false,
      push_notifications: true,
    },
  });

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { y: -2, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        bio: (profile as any).bio || "",
        gender: (profile as any).gender || "",
        occupation: (profile as any).occupation || "",
        interests: (profile as any).interests || [],
        address:
          typeof profile.address === "object" && profile.address !== null
            ? (profile.address as any)
            : {
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              },
        social_media:
          typeof (profile as any).social_media === "object" &&
          (profile as any).social_media !== null
            ? (profile as any).social_media
            : {
                website: "",
                instagram: "",
                facebook: "",
                twitter: "",
                linkedin: "",
                youtube: "",
              },
        preferences:
          typeof (profile as any).preferences === "object" &&
          (profile as any).preferences !== null
            ? (profile as any).preferences
            : {
                language: "en",
                currency: "INR",
                timezone: "Asia/Kolkata",
              },
        notification_settings:
          typeof (profile as any).notification_settings === "object" &&
          (profile as any).notification_settings !== null
            ? (profile as any).notification_settings
            : {
                email_marketing: true,
                email_orders: true,
                sms_notifications: false,
                push_notifications: true,
              },
      });
    }
  }, [profile]);

  const handleInputChange = (
    field: string,
    value: string | string[] | boolean
  ) => {
    const keys = field.split(".");
    if (keys.length === 1) {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setProfileData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof ProfileData],
          [keys[1]]: value,
        },
      }));
    }
  };

  const toggleInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await clientDb.updateUserProfile(user.id, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth || null,
        bio: profileData.bio,
        gender: profileData.gender,
        occupation: profileData.occupation,
        interests: profileData.interests,
        address: profileData.address,
        social_media: profileData.social_media,
        preferences: profileData.preferences,
        notification_settings: profileData.notification_settings,
        updated_at: new Date().toISOString(),
      });

      await refreshProfile();
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        bio: (profile as any).bio || "",
        gender: (profile as any).gender || "",
        occupation: (profile as any).occupation || "",
        interests: (profile as any).interests || [],
        address:
          typeof profile.address === "object" && profile.address !== null
            ? (profile.address as any)
            : {
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              },
        social_media:
          typeof (profile as any).social_media === "object" &&
          (profile as any).social_media !== null
            ? (profile as any).social_media
            : {
                website: "",
                instagram: "",
                facebook: "",
                twitter: "",
                linkedin: "",
                youtube: "",
              },
        preferences:
          typeof (profile as any).preferences === "object" &&
          (profile as any).preferences !== null
            ? (profile as any).preferences
            : {
                language: "en",
                currency: "INR",
                timezone: "Asia/Kolkata",
              },
        notification_settings:
          typeof (profile as any).notification_settings === "object" &&
          (profile as any).notification_settings !== null
            ? (profile as any).notification_settings
            : {
                email_marketing: true,
                email_orders: true,
                sms_notifications: false,
                push_notifications: true,
              },
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={cardVariants} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <User className="h-8 w-8 text-orange-500" />
              My Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your personal information and preferences
            </p>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="h-5 w-5" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Header Card */}
          <motion.div variants={cardVariants}>
            <Card className="border-2 border-black rounded-none">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-black">
                      <AvatarImage src={(profile as any)?.avatar_url} />
                      <AvatarFallback className="text-2xl bg-orange-100">
                        {profile?.first_name?.[0]}
                        {profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white border border-black rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <Mail className="h-4 w-4" />
                      {profile?.email}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-sm">
                      {profile?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-green-500" />
                          {profile.phone}
                        </span>
                      )}
                      {(profile as any)?.date_of_birth && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {new Date(
                            (profile as any).date_of_birth
                          ).toLocaleDateString()}
                        </span>
                      )}
                      {isArtisan && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          <Store className="h-3 w-3 mr-1" />
                          Artisan
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="border-2 border-black rounded-none"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-500 hover:bg-green-600 text-white border-2 border-black rounded-none"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 border-2 border-black rounded-none bg-gray-50">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="interests"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                <Heart className="h-4 w-4 mr-2" />
                Interests
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                <Globe className="h-4 w-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your basic personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="first_name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            First Name
                          </Label>
                          <Input
                            id="first_name"
                            value={profileData.first_name}
                            onChange={(e) =>
                              handleInputChange("first_name", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="last_name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Last Name
                          </Label>
                          <Input
                            id="last_name"
                            value={profileData.last_name}
                            onChange={(e) =>
                              handleInputChange("last_name", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            disabled={true} // Email shouldn't be editable directly
                            className="border-2 border-gray-300 rounded-none mt-1 bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed here
                          </p>
                        </div>
                        <div>
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <Label
                          htmlFor="bio"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>

                      {/* Personal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              handleInputChange("date_of_birth", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="gender"
                            className="flex items-center gap-2"
                          >
                            <Users className="h-4 w-4" />
                            Gender
                          </Label>
                          <Select
                            value={profileData.gender}
                            onValueChange={(value) =>
                              handleInputChange("gender", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-black rounded-none mt-1">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">
                                Prefer not to say
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="occupation"
                            className="flex items-center gap-2"
                          >
                            <Briefcase className="h-4 w-4" />
                            Occupation
                          </Label>
                          <Input
                            id="occupation"
                            value={profileData.occupation}
                            onChange={(e) =>
                              handleInputChange("occupation", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="Your profession"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Address */}
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        Address Information
                      </CardTitle>
                      <CardDescription>
                        Your residential address details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="street"
                          className="flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          value={profileData.address.street || ""}
                          onChange={(e) =>
                            handleInputChange("address.street", e.target.value)
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                          placeholder="123 Street Name"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="city"
                            className="flex items-center gap-2"
                          >
                            <Building className="h-4 w-4" />
                            City
                          </Label>
                          <Input
                            id="city"
                            value={profileData.address.city || ""}
                            onChange={(e) =>
                              handleInputChange("address.city", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="Your city"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="state"
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            State
                          </Label>
                          <Input
                            id="state"
                            value={profileData.address.state || ""}
                            onChange={(e) =>
                              handleInputChange("address.state", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="Your state"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="zip"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            ZIP Code
                          </Label>
                          <Input
                            id="zip"
                            value={profileData.address.zip || ""}
                            onChange={(e) =>
                              handleInputChange("address.zip", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="123456"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="country"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            Country
                          </Label>
                          <Input
                            id="country"
                            value={profileData.address.country || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "address.country",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="Your country"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-500" />
                        Your Interests
                      </CardTitle>
                      <CardDescription>
                        Select your hobbies and interests to personalize your
                        experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {interestCategories.map((category) => {
                          const Icon = category.icon;
                          const isSelected = profileData.interests.includes(
                            category.id
                          );
                          return (
                            <button
                              key={category.id}
                              onClick={() =>
                                isEditing && toggleInterest(category.id)
                              }
                              disabled={!isEditing}
                              className={`
                                p-4 border-2 rounded-none transition-all duration-200 text-left
                                ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                    : "border-gray-300 hover:border-gray-400"
                                }
                                ${
                                  !isEditing
                                    ? "cursor-not-allowed opacity-60"
                                    : "cursor-pointer hover:scale-105"
                                }
                              `}
                            >
                              <Icon
                                className={`h-6 w-6 mb-2 ${
                                  isSelected
                                    ? "text-orange-500"
                                    : "text-gray-500"
                                }`}
                              />
                              <div className="font-medium text-sm">
                                {category.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {profileData.interests.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">
                            Selected Interests:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.interests.map((interest) => {
                              const category = interestCategories.find(
                                (c) => c.id === interest
                              );
                              if (!category) return null;
                              const Icon = category.icon;
                              return (
                                <Badge
                                  key={interest}
                                  className="bg-orange-100 text-orange-700 border-orange-300"
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {category.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Social Media & Online Presence
                      </CardTitle>
                      <CardDescription>
                        Connect your social media accounts and website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                          value={profileData.social_media.website || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "social_media.website",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="instagram"
                            className="flex items-center gap-2"
                          >
                            <Instagram className="h-4 w-4 text-pink-500" />
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            value={profileData.social_media.instagram || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "social_media.instagram",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="facebook"
                            className="flex items-center gap-2"
                          >
                            <Facebook className="h-4 w-4 text-blue-600" />
                            Facebook
                          </Label>
                          <Input
                            id="facebook"
                            value={profileData.social_media.facebook || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "social_media.facebook",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="facebook.com/username"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="twitter"
                            className="flex items-center gap-2"
                          >
                            <Twitter className="h-4 w-4 text-blue-400" />
                            Twitter
                          </Label>
                          <Input
                            id="twitter"
                            value={profileData.social_media.twitter || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "social_media.twitter",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="linkedin"
                            className="flex items-center gap-2"
                          >
                            <Linkedin className="h-4 w-4 text-blue-700" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={profileData.social_media.linkedin || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "social_media.linkedin",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="youtube"
                          className="flex items-center gap-2"
                        >
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube
                        </Label>
                        <Input
                          id="youtube"
                          value={profileData.social_media.youtube || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "social_media.youtube",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                          placeholder="youtube.com/channel/..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Preferences */}
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-500" />
                        Preferences
                      </CardTitle>
                      <CardDescription>
                        Customize your experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label
                            htmlFor="language"
                            className="flex items-center gap-2"
                          >
                            <Languages className="h-4 w-4" />
                            Language
                          </Label>
                          <Select
                            value={profileData.preferences.language}
                            onValueChange={(value) =>
                              handleInputChange("preferences.language", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-black rounded-none mt-1">
                              <SelectValue placeholder="Select language" />
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
                        <div>
                          <Label
                            htmlFor="currency"
                            className="flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Currency
                          </Label>
                          <Select
                            value={profileData.preferences.currency}
                            onValueChange={(value) =>
                              handleInputChange("preferences.currency", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-black rounded-none mt-1">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem
                                  key={currency.code}
                                  value={currency.code}
                                >
                                  {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="timezone"
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            Timezone
                          </Label>
                          <Select
                            value={profileData.preferences.timezone}
                            onValueChange={(value) =>
                              handleInputChange("preferences.timezone", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-black rounded-none mt-1">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz.code} value={tz.code}>
                                  {tz.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Notification Settings */}
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-yellow-500" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <p className="font-medium">Order Updates</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get notified about your order status
                          </p>
                        </div>
                        <Switch
                          checked={
                            profileData.notification_settings.email_orders
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "notification_settings.email_orders",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <p className="font-medium">Marketing Emails</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Receive promotional offers and updates
                          </p>
                        </div>
                        <Switch
                          checked={
                            profileData.notification_settings.email_marketing
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "notification_settings.email_marketing",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-purple-500" />
                            <p className="font-medium">SMS Notifications</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get SMS alerts for important updates
                          </p>
                        </div>
                        <Switch
                          checked={
                            profileData.notification_settings.sms_notifications
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "notification_settings.sms_notifications",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-orange-500" />
                            <p className="font-medium">Push Notifications</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Receive browser push notifications
                          </p>
                        </div>
                        <Switch
                          checked={
                            profileData.notification_settings.push_notifications
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "notification_settings.push_notifications",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Account Actions */}
                <motion.div variants={cardVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        Account Actions
                      </CardTitle>
                      <CardDescription>
                        Manage your account security and data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 rounded-none"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <Button
                          variant="outline"
                          className="border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-none"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
