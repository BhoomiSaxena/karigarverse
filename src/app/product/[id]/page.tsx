"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
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
  Clock,
  Award,
  CheckCircle,
  Package,
  MessageCircle,
} from "lucide-react";
import { ClientDatabaseOperations } from "@/lib/database-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

// Animation variants
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

interface DatabaseProduct {
  id: string;
  artisan_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  features: string[] | null;
  tags: string[] | null;
  stock_quantity: number;
  sku: string | null;
  weight: number | null;
  dimensions: any;
  materials: string[] | null;
  care_instructions: string | null;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface ArtisanProfile {
  id: string;
  shop_name: string;
  description: string | null;
  location: string | null;
  rating: number | null;
  total_orders: number;
  verification_status: string;
  user_id: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useDatabase();
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
          const artisanData = await db.getArtisanProfileById(productData.artisan_id);
          setArtisan(artisanData);
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
      await db.addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
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
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Product link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard!",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product?.original_price && product.original_price > product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-y-3">
            <Link href="/products">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none">
                Browse All Products
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full border-2 border-gray-300 rounded-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumb */}
        <motion.div className="flex items-center gap-2 text-sm text-gray-600 mb-6" variants={itemVariants}>
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-500 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="relative aspect-square bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0">
                  -{discount}%
                </Badge>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-0"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`bg-white/80 backdrop-blur-sm border-0 ${
                    isWishlisted ? "text-red-500" : "text-gray-600"
                  }`}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index
                        ? "border-orange-500 ring-2 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.views_count.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.5 (23 reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {product.price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-gray-500 line-through flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock_quantity} available)
                  </span>
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Artisan Info */}
            {artisan && (
              <Card className="border-2 border-gray-200 rounded-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{artisan.shop_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {artisan.rating?.toFixed(1) || "4.5"}
                          </span>
                        </div>
                        {artisan.verification_status === "verified" && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {artisan.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{artisan.location}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/artisan/${artisan.id}`}>
                      <Button variant="outline" size="sm" className="border-2 border-gray-300 rounded-none">
                        View Shop
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                    className="h-10 w-10 rounded-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || isAddingToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none h-12"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 rounded-none h-12 px-6"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 pt-4 border-t-2 border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">Standard delivery in 5-7 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure transactions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-2 border-gray-200 rounded-none h-12">
              <TabsTrigger value="description" className="rounded-none">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none">
                Reviews (23)
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="description" className="space-y-4">
                <Card className="border-2 border-gray-200 rounded-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.care_instructions && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Care Instructions:</h4>
                        <p className="text-gray-700 leading-relaxed">{product.care_instructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <Card className="border-2 border-gray-200 rounded-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-600">Product ID:</span>
                          <span className="text-gray-900">{product.id.slice(0, 8)}...</span>
                        </div>
                        {product.sku && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">SKU:</span>
                            <span className="text-gray-900">{product.sku}</span>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Weight:</span>
                            <span className="text-gray-900">{product.weight} kg</span>
                          </div>
                        )}
                        {product.materials && product.materials.length > 0 && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Materials:</span>
                            <span className="text-gray-900">{product.materials.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-600">Stock:</span>
                          <span className="text-gray-900">{product.stock_quantity} pieces</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium text-gray-600">Created:</span>
                          <span className="text-gray-900">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {product.dimensions && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Dimensions:</span>
                            <span className="text-gray-900">
                              {product.dimensions.length && product.dimensions.width && product.dimensions.height
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

              <TabsContent value="reviews" className="space-y-4">
                <Card className="border-2 border-gray-200 rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">4.5 out of 5 (23 reviews)</span>
                      </div>
                    </div>

                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No reviews yet</p>
                      <p className="text-sm">Be the first to review this product!</p>
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none">
                        Write a Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <motion.div className="mt-12" variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products */}
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}