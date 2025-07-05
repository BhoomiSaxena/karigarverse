"use client";

import { useState } from "react";
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
import { currentArtisan } from "@/lib/data";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Artisan } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [artisan, setArtisan] = useState<Artisan>(currentArtisan);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(artisan);
  const { t } = useLanguage();

  const handleSave = () => {
    setArtisan(formData);
    setIsEditing(false);
    // Here you would typically make an API call to save the data
  };

  const handleCancel = () => {
    setFormData(artisan);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof Artisan] as Record<string, any>) || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

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
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Profile Header */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-2 border-black">
                            <AvatarImage
                              src={artisan.profileImage}
                              alt={artisan.name}
                            />
                            <AvatarFallback className="text-xl">
                              {artisan.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <Button
                              size="sm"
                              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white border border-black rounded-none"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold">
                              {artisan.name}
                            </h2>
                            {artisan.isVerified && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{artisan.email}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>
                                Joined{" "}
                                {new Date(
                                  artisan.joinDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-purple-500" />
                              <span>{artisan.totalProducts} Products</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span>
                                ₹{artisan.totalEarnings.toLocaleString()} Earned
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Personal Details Form */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio || ""}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                          placeholder="Tell customers about yourself and your craft..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.contactDetails.phone || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contactDetails.phone",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.contactDetails.address || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contactDetails.address",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.contactDetails.city}
                            onChange={(e) =>
                              handleInputChange(
                                "contactDetails.city",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.contactDetails.state}
                            onChange={(e) =>
                              handleInputChange(
                                "contactDetails.state",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Shop Details Tab */}
            <TabsContent value="shop">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-blue-500" />
                        Shop Information
                      </CardTitle>
                      <CardDescription>
                        Manage your shop details that customers will see
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="shopName">Shop Name</Label>
                        <Input
                          id="shopName"
                          value={formData.shopName}
                          onChange={(e) =>
                            handleInputChange("shopName", e.target.value)
                          }
                          disabled={!isEditing}
                          className="border-2 border-black rounded-none mt-1"
                        />
                      </div>

                      <div>
                        <Label>Shop Logo/Banner</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Upload your shop logo or banner
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-black rounded-none"
                            disabled={!isEditing}
                          >
                            Choose Image
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Shop Statistics */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle>Shop Performance</CardTitle>
                      <CardDescription>
                        Overview of your shop's performance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border border-gray-200 rounded-lg">
                          <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            {artisan.totalProducts}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Products
                          </div>
                        </div>
                        <div className="text-center p-4 border border-gray-200 rounded-lg">
                          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            {artisan.totalOrders}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Orders
                          </div>
                        </div>
                        <div className="text-center p-4 border border-gray-200 rounded-lg">
                          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            ₹{artisan.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Earnings
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Business Info Tab */}
            <TabsContent value="business">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Verification Status */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        Verification Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="font-medium text-green-700">
                              Account Verified
                            </p>
                            <p className="text-sm text-green-600">
                              Your artisan account has been verified
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Verified
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Information */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        Payment Information
                      </CardTitle>
                      <CardDescription>
                        Manage your payment and banking details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-yellow-700">
                              Bank Details Required
                            </p>
                            <p className="text-sm text-yellow-600">
                              Please add your bank details to receive payments
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            placeholder="Enter bank name"
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            placeholder="Enter account number"
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ifscCode">IFSC Code</Label>
                          <Input
                            id="ifscCode"
                            placeholder="Enter IFSC code"
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="panNumber">PAN Number</Label>
                          <Input
                            id="panNumber"
                            placeholder="Enter PAN number"
                            disabled={!isEditing}
                            className="border-2 border-black rounded-none mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Account Settings */}
                <motion.div variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account preferences and security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-600">
                            Receive updates about orders and account activity
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-600">
                            Get SMS alerts for important updates
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-black rounded-none"
                        >
                          Change Password
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-none"
                        >
                          Delete Account
                        </Button>
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
