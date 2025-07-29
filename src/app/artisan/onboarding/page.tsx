"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

// Animation variants following Karigarverse patterns
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: { duration: 0.2 },
  },
};

// Specialty categories matching the existing patterns
const specialtyCategories = [
  { value: "pottery", label: "Pottery & Ceramics", icon: "🏺" },
  { value: "textiles", label: "Textiles & Fabrics", icon: "🧵" },
  { value: "woodwork", label: "Woodwork & Carving", icon: "🪵" },
  { value: "jewelry", label: "Jewelry & Accessories", icon: "💍" },
  { value: "metalwork", label: "Metalwork", icon: "⚒️" },
  { value: "painting", label: "Painting & Art", icon: "🎨" },
  { value: "leather", label: "Leather Goods", icon: "🧳" },
  { value: "glasswork", label: "Glasswork", icon: "🔮" },
  { value: "basketry", label: "Basketry & Weaving", icon: "🧺" },
  { value: "other", label: "Other Crafts", icon: "✨" },
];

interface ArtisanFormData {
  shop_name: string;
  description: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  website_url: string;
  established_year: string;
  experience_years: string;
  specialties: string[];
}

export default function ArtisanOnboarding() {
  const { t } = useLanguage();
  const { user, createArtisanProfile } = useDatabase();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<ArtisanFormData>({
    shop_name: "",
    description: "",
    location: "",
    contact_phone: "",
    contact_email: user?.email || "",
    website_url: "",
    established_year: "",
    experience_years: "",
    specialties: [],
  });

  const handleInputChange = (field: keyof ArtisanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to become an artisan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      await createArtisanProfile({
        shop_name: formData.shop_name,
        description: formData.description || null,
        location: formData.location || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        website_url: formData.website_url || null,
        established_year: formData.established_year
          ? parseInt(formData.established_year)
          : null,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        specialties:
          formData.specialties.length > 0 ? formData.specialties : null,
        verification_status: "pending",
        status: "active",
      });

      toast({
        title: "Welcome to Karigarverse!",
        description: "Your artisan profile has been created successfully.",
      });

      // Redirect to dashboard
      router.push("/artisan/dashboard");
    } catch (error) {
      console.error("Error creating artisan profile:", error);
      toast({
        title: "Error",
        description: "Failed to create artisan profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.shop_name.trim() !== "";
      case 2:
        return (
          formData.location.trim() !== "" &&
          formData.contact_phone.trim() !== ""
        );
      case 3:
        return formData.specialties.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <motion.main
        className="flex-grow py-8 px-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Become an Artisan</h1>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 border-2 border-black">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black shadow-lg">
                  <CardHeader className="text-center">
                    <Store className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                    <CardTitle className="text-2xl">Shop Information</CardTitle>
                    <CardDescription>
                      Tell us about your craft business and expertise
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shop Name *
                      </label>
                      <Input
                        value={formData.shop_name}
                        onChange={(e) =>
                          handleInputChange("shop_name", e.target.value)
                        }
                        placeholder="e.g., Priya's Pottery Studio"
                        className="border-2 border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shop Description
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your craft, philosophy, and what makes your work unique..."
                        rows={4}
                        className="border-2 border-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Established Year
                        </label>
                        <Input
                          value={formData.established_year}
                          onChange={(e) =>
                            handleInputChange(
                              "established_year",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2015"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="border-2 border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Years of Experience
                        </label>
                        <Input
                          value={formData.experience_years}
                          onChange={(e) =>
                            handleInputChange(
                              "experience_years",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 8"
                          type="number"
                          min="0"
                          max="100"
                          className="border-2 border-black"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black shadow-lg">
                  <CardHeader className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <CardTitle className="text-2xl">
                      Contact & Location
                    </CardTitle>
                    <CardDescription>
                      Help customers find and connect with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Location *
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder="e.g., Jaipur, Rajasthan"
                        className="border-2 border-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contact Phone *
                        </label>
                        <Input
                          value={formData.contact_phone}
                          onChange={(e) =>
                            handleInputChange("contact_phone", e.target.value)
                          }
                          placeholder="+91 9876543210"
                          type="tel"
                          className="border-2 border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contact Email
                        </label>
                        <Input
                          value={formData.contact_email}
                          onChange={(e) =>
                            handleInputChange("contact_email", e.target.value)
                          }
                          placeholder="your@email.com"
                          type="email"
                          className="border-2 border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Website URL (Optional)
                      </label>
                      <Input
                        value={formData.website_url}
                        onChange={(e) =>
                          handleInputChange("website_url", e.target.value)
                        }
                        placeholder="https://yourwebsite.com"
                        type="url"
                        className="border-2 border-black"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Specialties */}
            {currentStep === 3 && (
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black shadow-lg">
                  <CardHeader className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                    <CardTitle className="text-2xl">Your Specialties</CardTitle>
                    <CardDescription>
                      Select the craft categories that best represent your work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {specialtyCategories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleSpecialtyToggle(category.value)}
                          className={`
                            p-3 rounded-lg border-2 border-black transition-all duration-200
                            ${
                              formData.specialties.includes(category.value)
                                ? "bg-purple-100 shadow-md transform scale-105"
                                : "bg-white hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <div className="text-sm font-medium">
                            {category.label}
                          </div>
                        </button>
                      ))}
                    </div>

                    {formData.specialties.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Selected Specialties:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.specialties.map((specialty) => {
                            const category = specialtyCategories.find(
                              (cat) => cat.value === specialty
                            );
                            return (
                              <Badge
                                key={specialty}
                                variant="secondary"
                                className="border-2 border-black"
                              >
                                {category?.icon} {category?.label}
                                <button
                                  onClick={() =>
                                    handleSpecialtyToggle(specialty)
                                  }
                                  className="ml-2 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="border-2 border-black"
              >
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`
                      w-3 h-3 rounded-full border-2 border-black
                      ${step <= currentStep ? "bg-purple-500" : "bg-white"}
                    `}
                  />
                ))}
              </div>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!isStepValid()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-2 border-black"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Become an Artisan
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
