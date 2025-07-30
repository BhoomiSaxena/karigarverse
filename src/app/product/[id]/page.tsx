"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ClientDatabaseOperations } from "@/lib/database-client";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/lib/types";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Eye,
  IndianRupee,
  MapPin,
  Award,
  CheckCircle,
  Package,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  ThumbsUp,
  Zap,
  ArrowLeft,
} from "lucide-react";
import type { Database } from "@/lib/database.types";

type DatabaseProduct = Database["public"]["Tables"]["products"]["Row"];
type ArtisanProfile = Database["public"]["Tables"]["artisan_profiles"]["Row"];

const convertDatabaseProduct = (dbProduct: DatabaseProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  rating: 4.5, // Default rating, should be calculated from reviews
  reviewCount: 0, // Default, should be fetched from reviews
  images: dbProduct.images || [],
  category: dbProduct.category_id,
  artisanName: "", // Will be filled from artisan data
  artisanId: dbProduct.artisan_id,
  description: dbProduct.description,
  features: dbProduct.features || undefined,
  stock: dbProduct.stock_quantity || 0,
  tags: dbProduct.tags || undefined,
  isActive: dbProduct.is_active || false,
  isFeatured: dbProduct.is_featured || false,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

// Modern Karigarverse animation variants with proper typing
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99] as const,
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] as const },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useDatabase();
  const { addToCart } = useCart();
  const { toast } = useToast();

  // States
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [error, setError] = useState<string | null>(null);

  const db = new ClientDatabaseOperations();
  const productId = params.id as string;

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setError("Product ID not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch product details
        const productData = await db.getProduct(productId);

        if (!productData) {
          setError("Product not found");
          setIsLoading(false);
          return;
        }

        setProduct(productData);

        // Fetch artisan details
        try {
          const artisanData = await db.getArtisanProfileById(
            productData.artisan_id
          );
          if (artisanData) {
            setArtisan(artisanData);
          }
        } catch (err) {
          console.error("Error loading artisan data:", err);
          // Continue even if artisan data fails
        }

        // Increment view count
        try {
          await db.incrementProductViews(productId);
        } catch (err) {
          console.error("Error incrementing views:", err);
          // Non-critical error, continue
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      // Toast is handled by the CartContext
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Error toast is also handled by the CartContext
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "📋 Link Copied!",
          description: "Product link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "📋 Link Copied!",
        description: "Product link copied to clipboard!",
      });
    }
  };

  const calculateDiscount = () => {
    if (product?.original_price && product.original_price > product.price) {
      return Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100
      );
    }
    return 0;
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 font-[family-name:var(--font-kalam)] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-yellow-500 mx-auto animate-spin"
              style={{ animationDelay: "150ms", animationDirection: "reverse" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Amazing Product...
          </h2>
          <p className="text-gray-600 animate-pulse">
            Preparing something beautiful for you ✨
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 font-[family-name:var(--font-kalam)] flex items-center justify-center">
        <motion.div
          className="text-center max-w-lg mx-auto p-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_#000]"
            whileHover={{ y: -2, boxShadow: "12px 12px 0px 0px #000" }}
          >
            <Package className="h-20 w-20 text-orange-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Product Not Found
            </h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {error ||
                "The amazing product you're looking for seems to have wandered off! 🤔"}
            </p>
            <div className="space-y-4">
              <Link href="/products">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-4 border-black rounded-xl text-lg py-6 font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200">
                  🛍️ Discover Amazing Products
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-4 border-black rounded-xl text-lg py-6 font-bold bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {/* Modern Breadcrumb */}
          <motion.div
            className="flex items-center gap-3 text-lg text-gray-700 mb-8 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-black/20 w-fit"
            variants={cardVariants}
          >
            <Link
              href="/"
              className="hover:text-orange-500 transition-colors font-semibold hover:scale-105 transform duration-200"
            >
              🏠 Home
            </Link>
            <span className="text-orange-400">→</span>
            <Link
              href="/products"
              className="hover:text-orange-500 transition-colors font-semibold hover:scale-105 transform duration-200"
            >
              🛍️ Products
            </Link>
            <span className="text-orange-400">→</span>
            <span className="text-gray-900 font-bold truncate max-w-xs">
              {product.name}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Modern Product Images Gallery */}
            <motion.div className="space-y-6" variants={cardVariants}>
              <div className="relative">
                <motion.div
                  className="relative aspect-square bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000]"
                  whileHover={{ y: -4, boxShadow: "12px 12px 0px 0px #000" }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={
                          product.images[selectedImage] || "/placeholder.svg"
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <motion.div
                      initial={{ rotate: -12, scale: 0 }}
                      animate={{ rotate: -12, scale: 1 }}
                      className="absolute top-4 left-4 z-10"
                    >
                      <Badge className="bg-red-500 text-white border-2 border-black text-lg font-bold py-2 px-4 rounded-xl shadow-[4px_4px_0px_0px_#000]">
                        🔥 {discount}% OFF
                      </Badge>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-3 z-10">
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl text-gray-700 hover:bg-white shadow-[2px_2px_0px_0px_#000]"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        size="sm"
                        className={`bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] ${
                          isWishlisted
                            ? "text-red-500 bg-red-50"
                            : "text-gray-700 hover:bg-white"
                        }`}
                        onClick={() => setIsWishlisted(!isWishlisted)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isWishlisted ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <Button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-black rounded-full w-12 h-12 shadow-[2px_2px_0px_0px_#000]"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-2 border-black rounded-full w-12 h-12 shadow-[2px_2px_0px_0px_#000]"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </motion.div>

                {/* Thumbnail Grid */}
                {product.images.length > 1 && (
                  <motion.div
                    className="grid grid-cols-4 gap-3"
                    variants={cardVariants}
                  >
                    {product.images.map((image, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square bg-white border-3 rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedImage === index
                            ? "border-orange-500 ring-4 ring-orange-200 shadow-[4px_4px_0px_0px_#f97316]"
                            : "border-gray-300 hover:border-gray-400 shadow-[2px_2px_0px_0px_#d1d5db]"
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Modern Product Info */}
            <motion.div className="space-y-8" variants={cardVariants}>
              {/* Product Title & Stats */}
              <div className="bg-white/80 backdrop-blur-sm border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border-2 border-blue-200">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">
                      {(product.views_count || 0).toLocaleString()} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full border-2 border-yellow-200">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8 (47 reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full border-2 border-green-200">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">98% liked</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="flex items-baseline gap-4 mb-6">
                  <motion.span
                    className="text-4xl font-black text-gray-900 flex items-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <IndianRupee className="h-8 w-8" />
                    {product.price.toLocaleString()}
                  </motion.span>
                  {product.original_price &&
                    product.original_price > product.price && (
                      <span className="text-2xl text-gray-500 line-through flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {product.original_price.toLocaleString()}
                      </span>
                    )}
                  {discount > 0 && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-black">
                      Save ₹
                      {(
                        product.original_price! - product.price
                      ).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {product.stock_quantity > 0 ? (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border-2 border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-bold">
                        ✅ In Stock ({product.stock_quantity} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border-2 border-red-200">
                      <Package className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-bold">
                        ❌ Out of Stock
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Artisan Info Card */}
              {artisan && (
                <motion.div
                  className="bg-white/80 backdrop-blur-sm border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]"
                  whileHover={{ y: -2, boxShadow: "12px 12px 0px 0px #000" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {artisan.shop_name}
                        </h3>
                        {artisan.verification_status === "verified" && (
                          <Badge className="bg-blue-500 text-white border-2 border-black rounded-full">
                            <Award className="h-3 w-3 mr-1" />
                            Verified ✓
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">
                            {artisan.rating?.toFixed(1) || "4.8"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">
                            {artisan.total_orders} orders
                          </span>
                        </div>
                        {artisan.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {artisan.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/artisan/${artisan.id}`}>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-xl font-bold shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200">
                        Visit Shop 🏪
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Quantity & Add to Cart */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] space-y-6"
                variants={cardVariants}
              >
                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-gray-900">
                    Quantity:
                  </span>
                  <div className="flex items-center border-4 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_#000]">
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-12 w-12 rounded-l-lg border-r-2 border-black font-bold text-lg"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                    </motion.div>
                    <span className="w-16 text-center font-black text-xl bg-yellow-50">
                      {quantity}
                    </span>
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                        className="h-12 w-12 rounded-r-lg border-l-2 border-black font-bold text-lg"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.div
                    className="flex-1"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0 || isAddingToCart}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white border-4 border-black rounded-xl text-xl py-6 font-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      {isAddingToCart ? "Adding... ⏳" : "Add to Cart 🛒"}
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-4 border-black rounded-xl text-xl py-6 px-8 font-bold bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200"
                      onClick={handleShare}
                    >
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Delivery Info */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] space-y-4"
                variants={cardVariants}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🚀 Delivery & Services
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                    <Truck className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-800">
                        Free Delivery 🚚
                      </p>
                      <p className="text-sm text-green-700">
                        Standard delivery in 5-7 business days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <RotateCcw className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-800">Easy Returns 🔄</p>
                      <p className="text-sm text-blue-700">
                        7-day hassle-free return policy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-bold text-purple-800">
                        Secure Payment 🔒
                      </p>
                      <p className="text-sm text-purple-700">
                        100% secure & encrypted transactions
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Modern Product Details Tabs */}
          <motion.div className="mb-16" variants={cardVariants}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_0px_#000] h-16">
                <TabsTrigger
                  value="description"
                  className="rounded-xl text-lg font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_#000]"
                >
                  📝 Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-xl text-lg font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_#000]"
                >
                  📊 Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-xl text-lg font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_#000]"
                >
                  ⭐ Reviews (47)
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="description" className="space-y-6">
                  <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        ✨ Product Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-8">
                        {product.description}
                      </p>

                      {product.features && product.features.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-gray-900 mb-4">
                            🌟 Key Features:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border-2 border-green-200"
                              >
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.care_instructions && (
                        <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200">
                          <h4 className="text-xl font-bold text-gray-900 mb-3">
                            🧼 Care Instructions:
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {product.care_instructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-6">
                  <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        📋 Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b-2 border-gray-200">
                            <span className="font-bold text-gray-600">
                              Product ID:
                            </span>
                            <span className="text-gray-900 font-mono">
                              {product.id.slice(0, 8)}...
                            </span>
                          </div>
                          {product.sku && (
                            <div className="flex justify-between py-3 border-b-2 border-gray-200">
                              <span className="font-bold text-gray-600">
                                SKU:
                              </span>
                              <span className="text-gray-900 font-mono">
                                {product.sku}
                              </span>
                            </div>
                          )}
                          {product.weight && (
                            <div className="flex justify-between py-3 border-b-2 border-gray-200">
                              <span className="font-bold text-gray-600">
                                Weight:
                              </span>
                              <span className="text-gray-900">
                                {product.weight} kg
                              </span>
                            </div>
                          )}
                          {product.materials &&
                            product.materials.length > 0 && (
                              <div className="flex justify-between py-3 border-b-2 border-gray-200">
                                <span className="font-bold text-gray-600">
                                  Materials:
                                </span>
                                <span className="text-gray-900">
                                  {product.materials.join(", ")}
                                </span>
                              </div>
                            )}
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b-2 border-gray-200">
                            <span className="font-bold text-gray-600">
                              Stock:
                            </span>
                            <span className="text-gray-900 font-bold">
                              {product.stock_quantity} pieces
                            </span>
                          </div>
                          <div className="flex justify-between py-3 border-b-2 border-gray-200">
                            <span className="font-bold text-gray-600">
                              Created:
                            </span>
                            <span className="text-gray-900">
                              {new Date(
                                product.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {product.dimensions && (
                            <div className="flex justify-between py-3 border-b-2 border-gray-200">
                              <span className="font-bold text-gray-600">
                                Dimensions:
                              </span>
                              <span className="text-gray-900">
                                {typeof product.dimensions === "object" &&
                                product.dimensions !== null &&
                                "length" in product.dimensions &&
                                "width" in product.dimensions &&
                                "height" in product.dimensions
                                  ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm`
                                  : "Not specified"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">
                          ⭐ Customer Reviews
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold text-gray-700">
                            4.8 out of 5 (47 reviews)
                          </span>
                        </div>
                      </div>

                      <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-gray-200">
                        <MessageCircle className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                        <h4 className="text-2xl font-bold mb-4 text-gray-800">
                          Share Your Experience! 💭
                        </h4>
                        <p className="text-lg mb-6 text-gray-600">
                          Be the first to review this amazing product!
                        </p>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-4 border-black rounded-xl text-lg py-4 px-8 font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200">
                          ✍️ Write a Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          {/* Related Products */}
          <motion.div className="mt-16" variants={cardVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              🔍 Similar Amazing Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Placeholder for related products */}
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="border-4 border-black rounded-2xl hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-300 bg-white overflow-hidden group"
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 relative overflow-hidden">
                      <div className="absolute inset-4 bg-white/50 rounded-xl animate-pulse"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="h-4 bg-white/70 rounded-full mb-2 animate-pulse"></div>
                        <div className="h-4 bg-white/70 rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
