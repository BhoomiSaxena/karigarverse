"use client";

import { useState, useEffect, useRef } from "react";
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
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
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
  Upload,
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
  avatar_url?: string;
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
  { code: "GBP", name: "British Pound (£)" },
];

// Timezones
const timezones = [
  { value: "Asia/Kolkata", name: "India Standard Time (IST)" },
  { value: "Asia/Dubai", name: "Gulf Standard Time (GST)" },
  { value: "America/New_York", name: "Eastern Time (ET)" },
  { value: "Europe/London", name: "Greenwich Mean Time (GMT)" },
];

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useDatabase();
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
    avatar_url: "",
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
  }, [user, loading, router]);

  // Load profile data when profile changes
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
        avatar_url: profile.avatar_url || "",
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

  // Handle profile photo upload
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (
        uploadError &&
        uploadError.message !== "The resource already exists"
      ) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      await clientDb.updateUserProfile(user.id, {
        avatar_url: publicUrl,
      });

      // Refresh profile data
      await refreshProfile();

      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form save
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await clientDb.updateUserProfile(user.id, profileData);
      await refreshProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle interest toggle
  const toggleInterest = (interestId: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  // Handle nested field updates
  const updateNestedField = (
    section: keyof ProfileData,
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

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              Please log in to view your profile.
            </p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-lg border-2 border-black mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-black shadow-lg">
                    <AvatarImage
                      src={profileData.avatar_url || profile.avatar_url || ""}
                      alt="Profile photo"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-100 to-pink-100">
                      {profileData.first_name[0]}
                      {profileData.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Photo Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-sm text-gray-600 mt-2 text-center">
                  Click camera icon to upload
                </p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">
                  {profileData.first_name} {profileData.last_name}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {profileData.email}
                </p>

                {profileData.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">
                    {profileData.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profileData.occupation && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Briefcase className="h-3 w-3" />
                      {profileData.occupation}
                    </Badge>
                  )}
                  {profileData.address.city && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {profileData.address.city}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {new Date(profile.created_at).getFullYear()}
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-100 border-2 border-black">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="interests"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Interests
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Social
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
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
                            setProfileData((prev) => ({
                              ...prev,
                              first_name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                        />
                      </div>

                      <div className="space-y-2">
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
                            setProfileData((prev) => ({
                              ...prev,
                              last_name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled={true} // Email should be read-only
                          className="border-2 border-black/20 bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Phone
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
                          className="border-2 border-black/20"
                        />
                      </div>

                      <div className="space-y-2">
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
                          className="border-2 border-black/20"
                        />
                      </div>

                      <div className="space-y-2">
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
                            setProfileData((prev) => ({
                              ...prev,
                              gender: value,
                            }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-2 border-black/20">
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
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Bio
                      </Label>
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
                        className="border-2 border-black/20 min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Occupation */}
                    <div className="space-y-2">
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
                          setProfileData((prev) => ({
                            ...prev,
                            occupation: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="border-2 border-black/20"
                        placeholder="Your profession or role"
                      />
                    </div>

                    <Separator className="border-black/10" />

                    {/* Address Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
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
                              updateNestedField(
                                "address",
                                "street",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black/20"
                          />
                        </div>

                        <div className="space-y-2">
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
                              updateNestedField(
                                "address",
                                "city",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={profileData.address.state || ""}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "state",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zip">PIN Code</Label>
                          <Input
                            id="zip"
                            value={profileData.address.zip || ""}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "zip",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={profileData.address.country || ""}
                            onChange={(e) =>
                              updateNestedField(
                                "address",
                                "country",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black/20"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Your Interests
                    </CardTitle>
                    <CardDescription>
                      Select your interests to help us personalize your
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
                          <motion.button
                            key={category.id}
                            onClick={() =>
                              isEditing && toggleInterest(category.id)
                            }
                            disabled={!isEditing}
                            whileHover={isEditing ? { scale: 1.05 } : {}}
                            whileTap={isEditing ? { scale: 0.95 } : {}}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              isSelected
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-black/20 hover:border-purple-300"
                            } ${
                              !isEditing
                                ? "opacity-60 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <Icon className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              {category.name}
                            </p>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 mx-auto mt-1 text-purple-600" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {profileData.interests.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-2">
                          Selected interests ({profileData.interests.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interestId) => {
                            const category = interestCategories.find(
                              (c) => c.id === interestId
                            );
                            return category ? (
                              <Badge key={interestId} variant="secondary">
                                {category.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription>
                      Connect your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
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
                            updateNestedField(
                              "social_media",
                              "website",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="instagram"
                          className="flex items-center gap-2"
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={profileData.social_media.instagram || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "social_media",
                              "instagram",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="@username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="facebook"
                          className="flex items-center gap-2"
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </Label>
                        <Input
                          id="facebook"
                          value={profileData.social_media.facebook || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "social_media",
                              "facebook",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="facebook.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="twitter"
                          className="flex items-center gap-2"
                        >
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={profileData.social_media.twitter || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "social_media",
                              "twitter",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="@username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="linkedin"
                          className="flex items-center gap-2"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={profileData.social_media.linkedin || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "social_media",
                              "linkedin",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="youtube"
                          className="flex items-center gap-2"
                        >
                          <Youtube className="h-4 w-4" />
                          YouTube
                        </Label>
                        <Input
                          id="youtube"
                          value={profileData.social_media.youtube || ""}
                          onChange={(e) =>
                            updateNestedField(
                              "social_media",
                              "youtube",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="border-2 border-black/20"
                          placeholder="youtube.com/@username"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
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
                            updateNestedField("preferences", "language", value)
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-2 border-black/20">
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

                      <div className="space-y-2">
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
                            updateNestedField("preferences", "currency", value)
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-2 border-black/20">
                            <SelectValue />
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

                      <div className="space-y-2">
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
                            updateNestedField("preferences", "timezone", value)
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-2 border-black/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
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
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label
                            htmlFor="email_orders"
                            className="flex items-center gap-2 font-medium"
                          >
                            <Mail className="h-4 w-4" />
                            Order Updates
                          </Label>
                          <p className="text-sm text-gray-600">
                            Get notified about order confirmations, shipping
                            updates, and delivery confirmations
                          </p>
                        </div>
                        <Switch
                          id="email_orders"
                          checked={
                            profileData.notification_settings.email_orders
                          }
                          onCheckedChange={(checked) =>
                            updateNestedField(
                              "notification_settings",
                              "email_orders",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label
                            htmlFor="email_marketing"
                            className="flex items-center gap-2 font-medium"
                          >
                            <Star className="h-4 w-4" />
                            Marketing Emails
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive promotional emails, new product
                            announcements, and special offers
                          </p>
                        </div>
                        <Switch
                          id="email_marketing"
                          checked={
                            profileData.notification_settings.email_marketing
                          }
                          onCheckedChange={(checked) =>
                            updateNestedField(
                              "notification_settings",
                              "email_marketing",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label
                            htmlFor="sms_notifications"
                            className="flex items-center gap-2 font-medium"
                          >
                            <Phone className="h-4 w-4" />
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive important updates via SMS (charges may
                            apply)
                          </p>
                        </div>
                        <Switch
                          id="sms_notifications"
                          checked={
                            profileData.notification_settings.sms_notifications
                          }
                          onCheckedChange={(checked) =>
                            updateNestedField(
                              "notification_settings",
                              "sms_notifications",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label
                            htmlFor="push_notifications"
                            className="flex items-center gap-2 font-medium"
                          >
                            <Bell className="h-4 w-4" />
                            Push Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Get real-time notifications in your browser when the
                            site is open
                          </p>
                        </div>
                        <Switch
                          id="push_notifications"
                          checked={
                            profileData.notification_settings.push_notifications
                          }
                          onCheckedChange={(checked) =>
                            updateNestedField(
                              "notification_settings",
                              "push_notifications",
                              checked
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Supabase Integration Test Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-2 border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <ShieldCheck className="h-5 w-5" />
                  Supabase Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Authentication Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Profile Sync Enabled</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>User ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Profile Created:</strong>{" "}
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
