"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Eye,
  ShoppingCart,
  AlertCircle,
  IndianRupee,
  Edit3,
  EyeOff,
  Trash2,
} from "lucide-react";
import { categories } from "@/lib/data";
import { ClientDatabaseOperations } from "@/lib/database-client";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Label } from "@/components/ui/label";

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStock: number;
  totalViews: number;
  totalSales: number;
}

export default function ArtisanProductsPage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    outOfStock: 0,
    totalViews: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const db = new ClientDatabaseOperations();

  // Get current user and artisan profile
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          // Get artisan profile
          const profile = await db.getArtisanProfile(user.id);
          setArtisanProfile(profile);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Fetch product statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!artisanProfile?.id) return;

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
          totalSales: products.reduce(
            (sum, p) => sum + (p.sales_count || 0),
            0
          ),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [artisanProfile]);

  // Build filters for the product grid
  const productFilters = {
    artisanId: artisanProfile?.id,
    search: searchQuery,
    category: selectedCategory,
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
    setSelectedCategory("");
    setStatusFilter("all");
  };

  if (isLoading) {
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

  return (
    <ArtisanLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-gray-200 rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 rounded-lg bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Active Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats.activeProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Draft Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {stats.draftProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 rounded-lg bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {stats.outOfStock}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white border-2 border-gray-200 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
              {/* Search */}
              <div className="relative min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-2 border-gray-300 rounded-lg"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory || statusFilter !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Search: "{searchQuery}"
                </Badge>
              )}
              {selectedCategory && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Category:{" "}
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          )}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {artisanProfile ? (
            <DynamicProductGrid
              title="Your Products"
              filters={productFilters}
              showHeader={false}
              showAddButton={true}
              gridCols="3"
              className="min-h-96"
            />
          ) : (
            <Card className="border-2 border-yellow-200 rounded-lg bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>
                    Please complete your artisan profile to start adding
                    products.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </ArtisanLayout>
  );
}
