"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArtisanLayout } from "@/components/artisan-layout";
import { DynamicProductGrid } from "@/components/dynamic-product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Search,
  TrendingUp,
  Eye,
  ShoppingCart,
  AlertCircle,
  IndianRupee,
  EyeOff,
  X,
} from "lucide-react";
import { ClientDatabaseOperations } from "@/lib/database-client";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useToast } from "@/hooks/use-toast";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStock: number;
  totalViews: number;
  totalSales: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ArtisanProductsPage() {
  const { t } = useLanguage();
  const { user, artisanProfile, loading } = useDatabase();
  const { toast } = useToast();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all_categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    outOfStock: 0,
    totalViews: 0,
    totalSales: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const db = new ClientDatabaseOperations();

  // Load categories and product statistics
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesData = await db.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  // Fetch product statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!artisanProfile?.id) {
        setIsLoadingStats(false);
        return;
      }

      setIsLoadingStats(true);
      try {
        const products = await db.getArtisanProducts(artisanProfile.id);

        const activeProducts = products.filter((p) => p.is_active).length;
        const draftProducts = products.filter((p) => !p.is_active).length;
        const outOfStock = products.filter(
          (p) => p.stock_quantity === 0
        ).length;

        setStats({
          totalProducts: products.length,
          activeProducts,
          draftProducts,
          outOfStock,
          totalViews: products.reduce(
            (sum, p) => sum + (p.views_count || 0),
            0
          ),
          totalSales: products.reduce((sum, p) => {
            // Calculate sales from order items if available
            return sum + (p.sales_count || 0);
          }, 0),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error",
          description: "Failed to load product statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [artisanProfile, refreshKey]);

  // Build filters for the product grid
  const productFilters = {
    artisanId: artisanProfile?.id,
    search: searchQuery,
    category:
      selectedCategory === "all_categories" ? undefined : selectedCategory,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "draft"
        ? false
        : undefined,
    limit: 50,
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all_categories");
    setStatusFilter("all");
  };

  if (loading || isLoadingStats) {
    return (
      <ArtisanLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        </div>
      </ArtisanLayout>
    );
  }

  if (!user || !artisanProfile) {
    return (
      <ArtisanLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="border-2 border-yellow-200 rounded-lg bg-yellow-50 p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Artisan Profile Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please complete your artisan profile to manage products.
              </p>
              <Link href="/artisan/profile">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </ArtisanLayout>
    );
  }

  return (
    <ArtisanLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          variants={cardVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-500" />
              Product Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your artisan products and inventory
            </p>
          </div>
          <Link href="/artisan/products/new">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={cardVariants}
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-gray-200 rounded-lg shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-green-200 rounded-lg bg-green-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">
                  Active Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-700">
                    {stats.activeProducts}
                  </div>
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-yellow-200 rounded-lg bg-yellow-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">
                  Draft Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-700">
                    {stats.draftProducts}
                  </div>
                  <EyeOff className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-red-200 rounded-lg bg-red-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-red-700">
                    {stats.outOfStock}
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={cardVariants}
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-blue-200 rounded-lg bg-blue-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-700">
                    {stats.totalViews.toLocaleString()}
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="border-2 border-purple-200 rounded-lg bg-purple-50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-purple-700 flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {stats.totalSales.toLocaleString()}
                  </div>
                  <ShoppingCart className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md"
          variants={cardVariants}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
              {/* Search */}
              <div className="relative min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-300 rounded-none focus:border-orange-500"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 border-2 border-gray-300 rounded-none focus:border-orange-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-gray-300 rounded-none focus:border-orange-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery ||
              selectedCategory !== "all_categories" ||
              statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2 border-gray-300 rounded-none hover:border-orange-500"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {(searchQuery ||
              selectedCategory !== "all_categories" ||
              statusFilter !== "all") && (
              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all_categories" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Category:{" "}
                    {categories.find((c) => c.id === selectedCategory)?.name ||
                      "Unknown"}
                    <button
                      onClick={() => setSelectedCategory("all_categories")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={cardVariants}
          className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Your Products
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>

          <div className="p-6">
            <DynamicProductGrid
              title=""
              filters={productFilters}
              showHeader={false}
              showAddButton={false}
              gridCols="3"
              className="min-h-96"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-6 shadow-md"
          variants={cardVariants}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/artisan/products/new">
              <Button
                variant="outline"
                className="w-full h-auto p-4 border-2 border-orange-300 rounded-none hover:border-orange-500 hover:bg-orange-100 transition-all duration-200"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-semibold">Add Product</div>
                  <div className="text-sm text-gray-600">
                    Create a new product listing
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/artisan/orders">
              <Button
                variant="outline"
                className="w-full h-auto p-4 border-2 border-blue-300 rounded-none hover:border-blue-500 hover:bg-blue-100 transition-all duration-200"
              >
                <div className="text-center">
                  <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-semibold">View Orders</div>
                  <div className="text-sm text-gray-600">
                    Check your recent orders
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/artisan/dashboard">
              <Button
                variant="outline"
                className="w-full h-auto p-4 border-2 border-green-300 rounded-none hover:border-green-500 hover:bg-green-100 transition-all duration-200"
              >
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-semibold">Analytics</div>
                  <div className="text-sm text-gray-600">
                    View performance metrics
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </ArtisanLayout>
  );
}
