"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DynamicProductGrid } from "@/components/dynamic-product-grid";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { categories } from "@/lib/data";
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
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const { t } = useLanguage();

  const getFilters = () => {
    const filters: any = {
      isActive: true,
      limit: 50,
    };

    if (selectedCategory && selectedCategory !== "all") {
      filters.category = selectedCategory;
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    return filters;
  };

  return (
    <ProductsProvider>
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.h1
              className="text-4xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("shop.title")}
            </motion.h1>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Filter Sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full md:w-1/4 lg:w-1/5 p-6 border-2 border-black/10 rounded-lg h-fit"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{t("shop.filters")}</h2>
                  <Button variant="ghost" className="md:hidden">
                    <Filter size={20} />
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Search</h3>
                  <div className="relative">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-2 border-black/20 rounded-none pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {t("shop.category")}
                  </h3>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="border-2 border-black/20 rounded-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="font-kalam border-2 border-black rounded-none bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {t(`category.${category.id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {t("shop.price_range")}
                  </h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    step={100}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}+</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 5000]);
                    setSortBy("relevance");
                  }}
                >
                  Clear Filters
                </Button>
              </motion.aside>

              {/* Product Grid */}
              <section className="w-full md:w-3/4 lg:w-4/5">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600">
                    Products from our artisan marketplace
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
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

                <DynamicProductGrid
                  filters={getFilters()}
                  showHeader={false}
                  gridCols="3"
                  className="mb-12"
                />

                {/* Pagination would go here in a real implementation */}
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProductsProvider>
  );
}
