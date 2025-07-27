"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Palette,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Heart,
  Eye,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDatabase } from "@/contexts/DatabaseContext";
import { clientDb } from "@/lib/database-client";

// Enhanced animation variants with proper typing
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.2,
    },
  },
};

const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock_quantity: string;
  images: string[];
  features: string[];
  tags: string[];
  materials: string[];
  care_instructions: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  sku: string;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  stock_quantity: "",
  images: [],
  features: [],
  tags: [],
  materials: [],
  care_instructions: "",
  weight: "",
  dimensions: {
    length: "",
    width: "",
    height: "",
  },
  sku: "",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, artisanProfile, loading } = useDatabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Array input states
  const [newFeature, setNewFeature] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newMaterial, setNewMaterial] = useState("");

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await clientDb.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    loadCategories();
  }, [toast]);

  // Generate SKU automatically when product name changes
  useEffect(() => {
    if (formData.name && artisanProfile?.shop_name) {
      const shopPrefix = artisanProfile.shop_name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "X");
      const namePrefix = formData.name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "X");
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const sku = `${shopPrefix}${namePrefix}${randomSuffix}`;
      setFormData((prev) => ({ ...prev, sku }));
    }
  }, [formData.name, artisanProfile?.shop_name]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (
    dimension: keyof typeof formData.dimensions,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  // Enhanced image upload with preview
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (formData.images.length >= 10) {
      toast({
        title: "Image limit reached",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64String],
        }));
        setIsUploadingImage(false);
        toast({
          title: "Image uploaded! 📸",
          description: "Your image has been added successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setIsUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    toast({
      title: "Image removed",
      description: "Image has been removed from your product.",
    });
  };

  // Enhanced array field handlers with animations
  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
      toast({
        title: "Feature added! ✨",
        description: `Added "${newFeature.trim()}" to product features.`,
      });
    }
  };

  const removeFeature = (indexToRemove: number) => {
    const removedFeature = formData.features[indexToRemove];
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== indexToRemove),
    }));
    toast({
      title: "Feature removed",
      description: `Removed "${removedFeature}" from features.`,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
      toast({
        title: "Tag added! 🏷️",
        description: `Added "${newTag.trim()}" tag.`,
      });
    }
  };

  const removeTag = (indexToRemove: number) => {
    const removedTag = formData.tags[indexToRemove];
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
    toast({
      title: "Tag removed",
      description: `Removed "${removedTag}" tag.`,
    });
  };

  const addMaterial = () => {
    if (
      newMaterial.trim() &&
      !formData.materials.includes(newMaterial.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }));
      setNewMaterial("");
      toast({
        title: "Material added! 🧱",
        description: `Added "${newMaterial.trim()}" to materials list.`,
      });
    }
  };

  const removeMaterial = (indexToRemove: number) => {
    const removedMaterial = formData.materials[indexToRemove];
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, index) => index !== indexToRemove),
    }));
    toast({
      title: "Material removed",
      description: `Removed "${removedMaterial}" from materials.`,
    });
  };

  // Enhanced form validation with detailed feedback
  const getValidationStatus = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.push("Valid price is required");
    if (!formData.category_id) errors.push("Category selection is required");
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0)
      errors.push("Stock quantity is required");
    if (formData.images.length === 0)
      errors.push("At least one image is required");
    if (
      formData.original_price &&
      parseFloat(formData.original_price) <= parseFloat(formData.price)
    ) {
      errors.push("Original price should be higher than current price");
    }

    return {
      isValid: errors.length === 0,
      errors,
      completionPercentage: Math.round(((6 - errors.length) / 6) * 100),
    };
  };

  // Enhanced form submission with success animation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !artisanProfile?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in and complete your artisan profile first.",
        variant: "destructive",
      });
      return;
    }

    const validation = getValidationStatus();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare product data for database
      const productData = {
        artisan_id: artisanProfile.id,
        category_id: formData.category_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        images: formData.images,
        features: formData.features.length > 0 ? formData.features : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        materials: formData.materials.length > 0 ? formData.materials : null,
        stock_quantity: parseInt(formData.stock_quantity),
        care_instructions: formData.care_instructions.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions:
          formData.dimensions.length ||
          formData.dimensions.width ||
          formData.dimensions.height
            ? {
                length: formData.dimensions.length
                  ? parseFloat(formData.dimensions.length)
                  : null,
                width: formData.dimensions.width
                  ? parseFloat(formData.dimensions.width)
                  : null,
                height: formData.dimensions.height
                  ? parseFloat(formData.dimensions.height)
                  : null,
              }
            : null,
        sku: formData.sku || null,
        is_active: true,
        is_featured: false,
        views_count: 0,
      };

      // Create the product
      const newProduct = await clientDb.createProduct(productData);

      // Show success animation
      setShowSuccessAnimation(true);

      toast({
        title: "🎉 Product Created Successfully!",
        description: "Your product is now live and visible to customers!",
      });

      // Reset form
      setFormData(initialFormData);
      setNewFeature("");
      setNewTag("");
      setNewMaterial("");

      // Redirect after success animation
      setTimeout(() => {
        router.push("/artisan/products");
      }, 3000);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast({
        title: "Creation Failed",
        description:
          error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = getValidationStatus();

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-semibold">Loading your workspace...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !artisanProfile) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <motion.div
            className="text-center max-w-md"
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To add products, you need to complete your artisan profile first.
              This helps customers learn about you and your craft!
            </p>
            <Link href="/artisan/profile">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg border-2 border-black rounded-none">
                  <Store className="h-5 w-5 mr-2" />
                  Complete Profile
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center border-4 border-green-500"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Product Created! 🎉
              </h2>
              <p className="text-gray-600">
                Your product is now live on the marketplace!
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <span>Redirecting to products page...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {/* Enhanced Header */}
          <motion.div
            className="mb-8"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <Link href="/artisan/products">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-none hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                  </Button>
                </motion.div>
              </Link>

              {/* Progress Indicator */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">
                    Form Completion
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {validation.completionPercentage}%
                  </p>
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${validation.completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-black">
              <motion.div
                className="flex items-center justify-center gap-4 mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8 text-purple-500" />
                <h1 className="text-4xl font-bold text-gray-900">
                  Create New Product
                </h1>
                <Sparkles className="h-8 w-8 text-purple-500" />
              </motion.div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Craft a beautiful listing that showcases your handmade creation.
                Every detail matters in telling your product's unique story! ✨
              </p>
            </div>
          </motion.div>

          {/* Form with enhanced animations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information - Enhanced */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black rounded-2xl shadow-2xl bg-gradient-to-br from-white to-blue-50">
                  <CardHeader className="pb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Package className="h-7 w-7" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      The essential details that define your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label
                          htmlFor="name"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <FileText className="h-5 w-5 text-blue-500" />
                          Product Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="e.g., Handcrafted Ceramic Vase with Traditional Patterns"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-blue-500 transition-colors"
                          required
                        />
                        {formData.name && (
                          <motion.p
                            className="text-sm text-green-600 mt-1 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Great product name!
                          </motion.p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label
                          htmlFor="description"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <FileText className="h-5 w-5 text-blue-500" />
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Tell the story of your creation... What inspired you to make it? What makes it special? How is it crafted?"
                          className="border-2 border-gray-300 rounded-none min-h-[150px] text-lg focus:border-blue-500 transition-colors resize-none"
                          required
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-500">
                            {formData.description.length} characters
                          </p>
                          {formData.description.length > 50 && (
                            <motion.p
                              className="text-sm text-green-600 flex items-center gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Detailed description!
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="category"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <Palette className="h-5 w-5 text-blue-500" />
                          Category *
                        </Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) =>
                            handleInputChange("category_id", value)
                          }
                        >
                          <SelectTrigger className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-blue-500">
                            <SelectValue placeholder="Choose your craft category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {category.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    - {category.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="sku"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <Tag className="h-5 w-5 text-blue-500" />
                          Product Code (SKU)
                        </Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            handleInputChange("sku", e.target.value)
                          }
                          placeholder="Auto-generated product code"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 bg-gray-50"
                          readOnly
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          ✨ Automatically generated based on your shop and
                          product name
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pricing & Inventory - Enhanced */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black rounded-2xl shadow-2xl bg-gradient-to-br from-white to-green-50">
                  <CardHeader className="pb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <DollarSign className="h-7 w-7" />
                      Pricing & Inventory
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Set competitive prices and manage your stock
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label
                          htmlFor="price"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <span className="text-green-600">₹</span>
                          Current Price *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="0.00"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-green-500 transition-colors"
                          required
                        />
                        {formData.price && parseFloat(formData.price) > 0 && (
                          <motion.p
                            className="text-sm text-green-600 mt-1 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Price set!
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="original_price"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <span className="text-gray-500">₹</span>
                          Original Price
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        </Label>
                        <Input
                          id="original_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.original_price}
                          onChange={(e) =>
                            handleInputChange("original_price", e.target.value)
                          }
                          placeholder="0.00"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-green-500 transition-colors"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          💡 Show customers the discount they're getting
                        </p>
                        {formData.original_price &&
                          formData.price &&
                          parseFloat(formData.original_price) >
                            parseFloat(formData.price) && (
                            <motion.div
                              className="text-sm text-orange-600 mt-1 flex items-center gap-1 bg-orange-50 p-2 rounded"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <Star className="h-4 w-4" />
                              {Math.round(
                                ((parseFloat(formData.original_price) -
                                  parseFloat(formData.price)) /
                                  parseFloat(formData.original_price)) *
                                  100
                              )}
                              % discount!
                            </motion.div>
                          )}
                      </div>

                      <div>
                        <Label
                          htmlFor="stock"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <Package className="h-5 w-5 text-green-500" />
                          Stock Quantity *
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) =>
                            handleInputChange("stock_quantity", e.target.value)
                          }
                          placeholder="0"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-green-500 transition-colors"
                          required
                        />
                        {formData.stock_quantity &&
                          parseInt(formData.stock_quantity) > 0 && (
                            <motion.p
                              className="text-sm text-green-600 mt-1 flex items-center gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {parseInt(formData.stock_quantity) === 1
                                ? "1 item"
                                : `${formData.stock_quantity} items`}{" "}
                              in stock
                            </motion.p>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Product Images - Enhanced */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black rounded-2xl shadow-2xl bg-gradient-to-br from-white to-purple-50">
                  <CardHeader className="pb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Camera className="h-7 w-7" />
                      Product Images
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Showcase your product with stunning visuals (Max 10
                      images, 5MB each)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Enhanced Upload Area */}
                    <div className="text-center">
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="inline-block"
                      >
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            isUploadingImage || formData.images.length >= 10
                          }
                          className="bg-purple-500 hover:bg-purple-600 text-white border-2 border-black rounded-none text-lg px-8 py-4 min-w-[200px]"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 mr-2" />
                              Upload Image
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{formData.images.length}/10 images</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>Max 5MB each</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Image Preview Grid */}
                    {formData.images.length > 0 && (
                      <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {formData.images.map((image, index) => (
                          <motion.div
                            key={index}
                            className="relative group"
                            variants={cardVariants}
                            layoutId={`image-${index}`}
                          >
                            <div className="aspect-square rounded-xl border-2 border-gray-300 overflow-hidden bg-white shadow-lg">
                              <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                width={200}
                                height={200}
                              />
                            </div>

                            {/* Remove button */}
                            <motion.button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>

                            {/* Main image badge */}
                            {index === 0 && (
                              <motion.div
                                className="absolute bottom-2 left-2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Badge className="bg-blue-500 text-white text-xs py-1 px-2 flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Main
                                </Badge>
                              </motion.div>
                            )}

                            {/* Image number */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Empty state */}
                    {formData.images.length === 0 && (
                      <motion.div
                        className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50"
                        animate={{
                          borderColor: ["#d1d5db", "#c084fc", "#d1d5db"],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          No images yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Add stunning photos to showcase your craft
                        </p>
                        <p className="text-sm text-purple-600">
                          💡 Tip: Use natural light for the best results!
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Product Details - Enhanced */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black rounded-2xl shadow-2xl bg-gradient-to-br from-white to-orange-50">
                  <CardHeader className="pb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <ShoppingBag className="h-7 w-7" />
                      Product Details
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      Add rich details that help customers understand your
                      product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {/* Features */}
                    <div>
                      <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        Key Features
                      </Label>
                      <div className="flex gap-2 mb-4">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="e.g., Dishwasher safe, Handcrafted details"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-orange-500 transition-colors"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addFeature())
                          }
                        />
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            type="button"
                            onClick={addFeature}
                            disabled={!newFeature.trim()}
                            className="border-2 border-black rounded-none px-6 py-3"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        <div className="flex flex-wrap gap-3">
                          {formData.features.map((feature, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              layout
                            >
                              <Badge
                                variant="secondary"
                                className="border-2 border-blue-300 bg-blue-100 text-blue-700 text-sm py-2 px-4 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {feature}
                                <motion.button
                                  type="button"
                                  onClick={() => removeFeature(index)}
                                  className="ml-1 h-4 w-4 text-blue-700 hover:text-red-500 transition-colors"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>
                      {formData.features.length === 0 && (
                        <p className="text-gray-500 text-sm italic">
                          💡 Add features to highlight what makes your product
                          special
                        </p>
                      )}
                    </div>

                    {/* Materials */}
                    <div>
                      <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-500" />
                        Materials Used
                      </Label>
                      <div className="flex gap-2 mb-4">
                        <Input
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          placeholder="e.g., Clay, Natural fibers, Organic cotton"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-orange-500 transition-colors"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addMaterial())
                          }
                        />
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            type="button"
                            onClick={addMaterial}
                            disabled={!newMaterial.trim()}
                            className="border-2 border-black rounded-none px-6 py-3"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        <div className="flex flex-wrap gap-3">
                          {formData.materials.map((material, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              layout
                            >
                              <Badge
                                variant="secondary"
                                className="border-2 border-green-300 bg-green-100 text-green-700 text-sm py-2 px-4 flex items-center gap-2"
                              >
                                <Heart className="h-4 w-4" />
                                {material}
                                <motion.button
                                  type="button"
                                  onClick={() => removeMaterial(index)}
                                  className="ml-1 h-4 w-4 text-green-700 hover:text-red-500 transition-colors"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>
                      {formData.materials.length === 0 && (
                        <p className="text-gray-500 text-sm italic">
                          🌿 Let customers know what your product is made from
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-orange-500" />
                        Tags & Keywords
                      </Label>
                      <div className="flex gap-2 mb-4">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="e.g., handmade, traditional, eco-friendly"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-orange-500 transition-colors"
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                        />
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            type="button"
                            onClick={addTag}
                            disabled={!newTag.trim()}
                            className="border-2 border-black rounded-none px-6 py-3"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        <div className="flex flex-wrap gap-3">
                          {formData.tags.map((tag, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              layout
                            >
                              <Badge
                                variant="secondary"
                                className="border-2 border-purple-300 bg-purple-100 text-purple-700 text-sm py-2 px-4 flex items-center gap-2"
                              >
                                <Tag className="h-4 w-4" />#{tag}
                                <motion.button
                                  type="button"
                                  onClick={() => removeTag(index)}
                                  className="ml-1 h-4 w-4 text-purple-700 hover:text-red-500 transition-colors"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>
                      {formData.tags.length === 0 && (
                        <p className="text-gray-500 text-sm italic">
                          #️⃣ Add tags to help customers discover your product
                        </p>
                      )}
                    </div>

                    {/* Care Instructions */}
                    <div>
                      <Label
                        htmlFor="care_instructions"
                        className="text-lg font-semibold flex items-center gap-2"
                      >
                        <Heart className="h-5 w-5 text-orange-500" />
                        Care Instructions
                      </Label>
                      <Textarea
                        id="care_instructions"
                        value={formData.care_instructions}
                        onChange={(e) =>
                          handleInputChange("care_instructions", e.target.value)
                        }
                        placeholder="How should customers care for this product? Include cleaning, storage, and maintenance tips..."
                        className="border-2 border-gray-300 rounded-none text-lg min-h-[100px] focus:border-orange-500 transition-colors resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        💡 Help customers keep your product beautiful for years
                        to come
                      </p>
                    </div>

                    {/* Physical Properties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label
                          htmlFor="weight"
                          className="text-lg font-semibold flex items-center gap-2"
                        >
                          <Package className="h-5 w-5 text-orange-500" />
                          Weight (kg)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          placeholder="0.00"
                          className="border-2 border-gray-300 rounded-none text-lg py-3 focus:border-orange-500 transition-colors"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          📦 Helps with accurate shipping calculations
                        </p>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-5 w-5 text-orange-500" />
                          Dimensions (cm)
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.dimensions.length}
                            onChange={(e) =>
                              handleDimensionChange("length", e.target.value)
                            }
                            placeholder="Length"
                            className="border-2 border-gray-300 rounded-none text-sm py-3 focus:border-orange-500 transition-colors"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.dimensions.width}
                            onChange={(e) =>
                              handleDimensionChange("width", e.target.value)
                            }
                            placeholder="Width"
                            className="border-2 border-gray-300 rounded-none text-sm py-3 focus:border-orange-500 transition-colors"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.dimensions.height}
                            onChange={(e) =>
                              handleDimensionChange("height", e.target.value)
                            }
                            placeholder="Height"
                            className="border-2 border-gray-300 rounded-none text-sm py-3 focus:border-orange-500 transition-colors"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          📏 Optional but helpful for shipping and display
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Form Actions */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="border-2 border-black rounded-2xl shadow-2xl bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                      {/* Status Section */}
                      <div className="flex-1 text-center lg:text-left">
                        <AnimatePresence mode="wait">
                          {validation.isValid ? (
                            <motion.div
                              key="valid"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center justify-center lg:justify-start gap-3"
                            >
                              <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xl font-bold text-green-600">
                                  Ready to Launch! 🚀
                                </p>
                                <p className="text-sm text-gray-600">
                                  Your product listing is complete and ready to
                                  go live
                                </p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="invalid"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center justify-center lg:justify-start gap-3"
                            >
                              <div className="bg-orange-100 p-2 rounded-full">
                                <AlertCircle className="h-6 w-6 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xl font-bold text-orange-600">
                                  Almost There!
                                </p>
                                <p className="text-sm text-gray-600">
                                  {validation.errors[0]}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {validation.errors.length - 1} more fields to
                                  complete
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Link href="/artisan/products">
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              variant="outline"
                              className="border-2 border-gray-400 rounded-none text-lg px-6 py-3 hover:bg-gray-100"
                              disabled={isSubmitting}
                            >
                              <ArrowLeft className="h-5 w-5 mr-2" />
                              Cancel
                            </Button>
                          </motion.div>
                        </Link>

                        <motion.div
                          variants={buttonVariants}
                          whileHover={validation.isValid ? "hover" : "idle"}
                          whileTap={validation.isValid ? "tap" : "idle"}
                        >
                          <Button
                            type="submit"
                            disabled={!validation.isValid || isSubmitting}
                            className={`border-2 border-black rounded-none text-lg px-8 py-3 min-w-[200px] ${
                              validation.isValid
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {isSubmitting ? (
                                <motion.div
                                  key="submitting"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center"
                                >
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Creating Product...
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="create"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center"
                                >
                                  <Save className="h-5 w-5 mr-2" />
                                  Create Product
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Form Completion
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {validation.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${validation.completionPercentage}%`,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
