"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArtisanService, type DashboardData } from "@/lib/artisan-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Eye,
  Users,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Bell,
  Loader2,
} from "lucide-react";
import { ArtisanWelcomeGuide } from "@/components/artisan-welcome-guide";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

export default function ArtisanDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const {
    user,
    profile,
    artisanProfile,
    loading: dbLoading,
    isArtisan,
  } = useDatabase();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbLoading && user) {
      // Check if user has artisan profile first
      if (!isArtisan) {
        router.push("/artisan/check");
        return;
      }
      loadDashboardData();
    }
  }, [user, dbLoading, isArtisan, router]);

  const loadDashboardData = async () => {
    if (!user) {
      setError("Please log in to view your dashboard");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get dashboard data using the updated service
      const data = await ArtisanService.getDashboardData(user.id);
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (dbLoading || loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in to access your artisan dashboard.
            </p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if user needs to complete artisan onboarding
  if (user && !dbLoading && !isArtisan) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Redirecting to artisan check...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">No dashboard data available</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {t("artisan.welcome_back")}, {dashboardData.artisanName}!
                </h1>
                <p className="text-gray-600 mt-2">
                  {t("artisan.whats_happening")} {dashboardData.shopName}.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-black rounded-none relative"
                  asChild
                >
                  <Link href="/artisan/notifications">
                    <Bell className="h-5 w-5 mr-2" />
                    {t("artisan.notifications")}
                    {dashboardData.unreadNotificationCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {dashboardData.unreadNotificationCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  asChild
                >
                  <Link href="/artisan/products/new">
                    <Plus className="h-5 w-5 mr-2" />
                    {t("artisan.add_product")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Welcome Guide for New Users */}
          <ArtisanWelcomeGuide className="mb-8" />

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("artisan.total_products")}
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.totalProducts}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">
                      +{Math.max(0, dashboardData.stats.totalProducts - 10)}
                    </span>{" "}
                    {t("artisan.from_last_month")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("artisan.total_orders")}
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.totalOrders}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">
                      +{dashboardData.stats.pendingOrders}
                    </span>{" "}
                    {t("artisan.pending")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("artisan.total_earnings")}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{dashboardData.stats.totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">
                      +₹{dashboardData.stats.monthlyEarnings.toLocaleString()}
                    </span>{" "}
                    {t("artisan.this_month")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("artisan.total_views")}
                  </CardTitle>
                  <Eye className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.totalViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-blue-600">
                      {dashboardData.stats.conversionRate}%
                    </span>{" "}
                    {t("artisan.conversion_rate")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    {t("home.manage_products")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.manage_products_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/artisan/products">
                    <Button className="w-full border-2 border-black rounded-none bg-gray-100 hover:bg-gray-200 text-black">
                      {t("artisan.view_all_products")}
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-green-500" />
                    {t("home.track_orders")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.track_orders_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/artisan/orders">
                    <Button className="w-full border-2 border-black rounded-none bg-gray-100 hover:bg-gray-200 text-black">
                      {t("artisan.view_all_orders")}
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    {t("profile.update_profile")}
                  </CardTitle>
                  <CardDescription>
                    {t("artisan.manage_profile")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/artisan/profile">
                    <Button className="w-full border-2 border-black rounded-none bg-gray-100 hover:bg-gray-200 text-black">
                      {t("profile.edit_profile")}
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Recent Orders */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("artisan.recent_orders")}</CardTitle>
                    <Link
                      href="/artisan/orders"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t("home.view_all")}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {order.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`text-xs ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ₹{order.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Products */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("artisan.top_products")}</CardTitle>
                    <Link
                      href="/artisan/products"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t("home.view_all")}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.topProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {product.sales} {t("artisan.sales")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{product.price}</p>
                          <p className="text-sm text-gray-600">
                            {product.views} {t("artisan.views")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
