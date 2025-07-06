"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { products, categories } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { motion } from "framer-motion"; // Import motion
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { useEffect, useState } from "react"; // For simulating loading
import { useLanguage } from "@/contexts/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation for product cards
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate 1.5 second load time
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold">Shop Our Artisan Collection</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar (can also be animated) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.5, delay: 0.2 },
            }}
            className="w-full md:w-1/4 lg:w-1/5 p-6 border-2 border-black/10 rounded-lg h-fit"
          >
            {/* ... (rest of filter sidebar content) ... */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t("shop.filters")}</h2>
              <Button variant="ghost" className="md:hidden">
                <Filter size={20} />
              </Button>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("shop.price_range")}
              </h3>
              <Slider
                defaultValue={[500]}
                max={5000}
                step={100}
                className="my-4"
              />
              <div className="flex justify-between text-sm">
                <span>₹0</span>
                <span>₹5000+</span>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("shop.category")}
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox id={`cat-${category.id}`} />
                    <Label htmlFor={`cat-${category.id}`} className="text-base">
                      {t(`category.${category.id}`)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{t("shop.rating")}</h3>
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="text-base">
                    {rating}+ {t("shop.stars")}
                  </Label>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200"
            >
              {t("shop.apply_filters")}
            </Button>
          </motion.aside>

          {/* Product Grid */}
          <section className="w-full md:w-3/4 lg:w-4/5">
            {/* ... (rest of sort options) ... */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {t("shop.products_found", { count: products.length })}
              </p>
              <Select>
                <SelectTrigger className="w-[180px] border-2 border-black rounded-none focus:ring-0">
                  <SelectValue placeholder={t("shop.sort_by")} />
                </SelectTrigger>
                <SelectContent className="font-kalam border-2 border-black rounded-none bg-white">
                  <SelectItem value="relevance">
                    {t("shop.relevance")}
                  </SelectItem>
                  <SelectItem value="price-asc">
                    {t("shop.price_low_high")}
                  </SelectItem>
                  <SelectItem value="price-desc">
                    {t("shop.price_high_low")}
                  </SelectItem>
                  <SelectItem value="newest">{t("shop.newest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-${index}`} />
                  ))
                : products.map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
            </motion.div>
            {/* ... (rest of pagination) ... */}
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                className="border-2 border-black rounded-none px-4 py-2 mx-1"
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="outline"
                className="border-2 border-black rounded-none px-4 py-2 mx-1 bg-gray-200"
              >
                1
              </Button>
              <Button
                variant="outline"
                className="border-2 border-black rounded-none px-4 py-2 mx-1"
              >
                2
              </Button>
              <Button
                variant="outline"
                className="border-2 border-black rounded-none px-4 py-2 mx-1"
              >
                {t("common.next")}
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
