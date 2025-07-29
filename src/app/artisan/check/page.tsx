"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Store,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Package,
  DollarSign,
} from "lucide-react";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
  },
  hover: {
    y: -5,
    scale: 1.02,
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

export default function ArtisanCheckPage() {
  const { user, artisanProfile, loading, isArtisan } = useDatabase();
  const { t } = useLanguage();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      // Small delay to show loading state
      const timer = setTimeout(() => {
        setChecking(false);

        // If user is already an artisan, redirect to dashboard
        if (isArtisan && artisanProfile) {
          router.push("/artisan/dashboard");
        }
      }, 1500);

      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // Not authenticated, redirect to login
      router.push("/login");
    }
  }, [user, artisanProfile, isArtisan, loading, router]);

  // Show loading state while checking
  if (loading || checking) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-purple-600" />
              <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Checking your artisan status...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your profile
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // If user is already an artisan, this will redirect above
  if (isArtisan && artisanProfile) {
    return null;
  }

  // Show artisan registration options
  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />

      <motion.main
        className="flex-grow py-12 px-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative inline-block mb-6">
              <Store className="h-20 w-20 mx-auto text-purple-600" />
              <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ready to Become an Artisan?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of artisans who are showcasing their crafts,
              connecting with customers, and building successful businesses on
              Karigarverse.
            </p>
          </motion.div>

          {/* Status Card */}
          <motion.div
            className="mb-12"
            variants={cardVariants}
            initial="initial"
            animate="animate"
          >
            <Card className="border-2 border-orange-300 bg-orange-50 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <CardTitle className="text-2xl text-orange-800">
                    Artisan Profile Required
                  </CardTitle>
                </div>
                <CardDescription className="text-orange-700 text-lg">
                  To access the artisan dashboard and start selling your crafts,
                  you need to create an artisan profile first.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card className="border-2 border-black hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <CardTitle className="text-xl">
                    Showcase Your Crafts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Upload unlimited products, create beautiful galleries, and
                    tell your craft story to the world.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-2 border-black hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <CardTitle className="text-xl">Manage Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Track orders, communicate with customers, and manage your
                    inventory all in one place.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="border-2 border-black hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <CardTitle className="text-xl">Earn Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Set your own prices, receive payments securely, and track
                    your earnings with detailed analytics.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Become Artisan Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="relative">
                    <Store className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                    <CheckCircle className="h-6 w-6 absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                  </div>
                  <CardTitle className="text-2xl text-purple-800 mb-2">
                    Become an Artisan
                  </CardTitle>
                  <CardDescription className="text-purple-700 text-base">
                    Create your artisan profile and start your journey with us.
                    This takes just a few minutes!
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-4">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-800 rounded-xl px-8 py-3 text-lg font-semibold transition-all transform hover:scale-105"
                    onClick={() => router.push("/artisan/onboarding")}
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Start Registration
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <p className="text-sm text-purple-600 mt-3">
                    ✨ Quick setup • No fees to start • Full support
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Continue as Customer Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="border-2 border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <CardTitle className="text-2xl text-gray-800 mb-2">
                    Continue as Customer
                  </CardTitle>
                  <CardDescription className="text-gray-700 text-base">
                    Browse and purchase beautiful handcrafted items from our
                    talented artisan community.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-600 text-gray-800 hover:bg-gray-100 rounded-xl px-8 py-3 text-lg font-semibold transition-all"
                    onClick={() => router.push("/")}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Browse Products
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <p className="text-sm text-gray-600 mt-3">
                    🛍️ Shop • Explore • Support artisans
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-600 text-lg">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@karigarverse.com"
                className="text-purple-600 hover:underline font-semibold"
              >
                support@karigarverse.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
