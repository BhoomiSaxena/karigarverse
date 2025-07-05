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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Mic,
} from "lucide-react";
import { categories } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { VoiceInputModal } from "@/components/ui/voice-input-modal";
import { VoiceCommandModal } from "@/components/ui/voice-command-modal";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  stock: string;
  images: string[];
  features: string[];
  tags: string[];
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "",
  stock: "",
  images: [],
  features: [],
  tags: [],
};

export default function AddEditProduct() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [newFeature, setNewFeature] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [commandModalConfig, setCommandModalConfig] = useState<{
    field: "price" | "stock";
    label: string;
  } | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalConfig, setVoiceModalConfig] = useState<{
    field: "name" | "description" | "newFeature" | "newTag";
    currentValue: string;
    label: string;
  } | null>(null);

  const openCommandModal = (field: "price" | "stock", label: string) => {
    setCommandModalConfig({ field, label });
    setIsCommandModalOpen(true);
  };

  const handleCommandApply = (value: number) => {
    if (!commandModalConfig) return;
    handleInputChange(commandModalConfig.field, value.toString());
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openVoiceModal = (
    field: "name" | "description" | "newFeature" | "newTag",
    label: string,
    currentValue: string = ""
  ) => {
    setVoiceModalConfig({ field, currentValue, label });
    setIsVoiceModalOpen(true);
  };

  const handleVoiceApply = (transcript: string) => {
    if (!voiceModalConfig) return;

    const { field } = voiceModalConfig;

    if (field === "name" || field === "description") {
      handleInputChange(field, transcript);
    } else if (field === "newFeature") {
      setNewFeature(transcript);
    } else if (field === "newTag") {
      setNewTag(transcript);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(
        (file, index) => `/images/placeholder-${Date.now()}-${index}.jpg`
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Product data:", formData);
    setIsSubmitting(false);
  };

  const isFormValid =
    formData.name &&
    formData.description &&
    formData.price &&
    formData.category &&
    formData.stock &&
    formData.images.length > 0;

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/artisan/products">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-black rounded-none"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")} to {t("artisan.products")}
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              {t("products.add_new_product")}
            </h1>
            <p className="text-gray-600 mt-2">{t("products.create_listing")}</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-500" />
                    {t("products.product_images")}
                  </CardTitle>
                  <CardDescription>
                    {t("products.product_images_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Drag and drop images here, or click to select
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-black rounded-none"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        Choose Images
                      </Button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-black">
                              <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">
                                Main
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                        className="border-2 border-black rounded-none pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() =>
                          openVoiceModal("name", "Product Name", formData.name)
                        }
                      >
                        <Mic className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <div className="relative mt-1">
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your product..."
                        className="border-2 border-black rounded-none pr-10"
                        rows={4}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-2 h-8 w-8"
                        onClick={() =>
                          openVoiceModal(
                            "description",
                            "Description",
                            formData.description
                          )
                        }
                      >
                        <Mic className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="border-2 border-black rounded-none mt-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="font-kalam border-2 border-black rounded-none">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          placeholder="Available quantity"
                          className="border-2 border-black rounded-none pr-10"
                          min="0"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() =>
                            openCommandModal("stock", "Stock Quantity")
                          }
                        >
                          <Mic className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Pricing
                  </CardTitle>
                  <CardDescription>Set your product pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Selling Price (₹) *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="0"
                          className="border-2 border-black rounded-none pr-10"
                          min="0"
                          step="1"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() =>
                            openCommandModal("price", "Selling Price")
                          }
                        >
                          <Mic className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handleInputChange("originalPrice", e.target.value)
                        }
                        placeholder="0 (optional)"
                        className="border-2 border-black rounded-none mt-1"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  {formData.price &&
                    formData.originalPrice &&
                    parseFloat(formData.originalPrice) >
                      parseFloat(formData.price) && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 text-sm">
                          Discount:{" "}
                          {Math.round(
                            ((parseFloat(formData.originalPrice) -
                              parseFloat(formData.price)) /
                              parseFloat(formData.originalPrice)) *
                              100
                          )}
                          % off
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle>Product Features</CardTitle>
                  <CardDescription>
                    Highlight key features and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-2 border-black/20 text-sm px-3 py-1 flex items-center gap-2"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="e.g., Handmade, Premium Quality"
                      className="border-2 border-black rounded-none h-12 pr-10"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addFeature())
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        openVoiceModal("newFeature", "Feature", newFeature)
                      }
                    >
                      <Mic className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      className="border-2 border-black rounded-none whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    Tags
                  </CardTitle>
                  <CardDescription>
                    Add tags to help customers find your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter a tag"
                      className="border-2 border-black rounded-none pr-10"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openVoiceModal("newTag", "Tag", newTag)}
                    >
                      <Mic className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button
                      type="button"
                      onClick={addTag}
                      className="bg-purple-500 hover:bg-purple-600 text-white border-2 border-black rounded-none"
                    >
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 border border-purple-300 pr-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 justify-end"
            >
              <Link href="/artisan/products">
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-black rounded-none"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>

      {isVoiceModalOpen && voiceModalConfig && (
        <VoiceInputModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onApply={handleVoiceApply}
          currentValue={voiceModalConfig.currentValue}
          fieldLabel={voiceModalConfig.label}
        />
      )}

      {isCommandModalOpen && commandModalConfig && (
        <VoiceCommandModal
          isOpen={isCommandModalOpen}
          onClose={() => setIsCommandModalOpen(false)}
          onApply={handleCommandApply}
          fieldLabel={commandModalConfig.label}
        />
      )}

      <Footer />
    </div>
  );
}
