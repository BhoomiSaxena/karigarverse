"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";
import { ClientDatabaseOperations } from "@/lib/database-client";
import type { Product } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Removed Supabase import - using PostgreSQL now

interface DynamicProductGridProps {
  title?: string;
  filters?: {
    category?: string;
    artisanId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    limit?: number;
    search?: string;
  };
  className?: string;
  showHeader?: boolean;
  gridCols?: "2" | "3" | "4";
  showAddButton?: boolean; // For artisan dashboard
}

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

// Helper function to convert database product to frontend Product type
const convertDatabaseProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  rating: 4.5, // Default rating since we don't have reviews aggregation yet
  reviewCount: 0, // Default review count
  images: dbProduct.images || ["/placeholder.svg"],
  category: dbProduct.category_id,
  artisanName: "Artisan", // We'll need to join with artisan data later
  description: dbProduct.description,
  features: dbProduct.features || [],
  stock: dbProduct.stock_quantity,
  tags: dbProduct.tags || [],
  isActive: dbProduct.is_active,
  createdAt: dbProduct.created_at,
});

export function DynamicProductGrid({
  title = "Products",
  filters = {},
  className = "",
  showHeader = true,
  gridCols = "4",
  showAddButton = false,
}: DynamicProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const db = new ClientDatabaseOperations();

  const fetchProducts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      // Default to active products only
      const productFilters = {
        isActive: true,
        ...filters,
      };

      const dbProducts = await db.getProducts(productFilters);
      const convertedProducts = dbProducts.map(convertDatabaseProduct);

      setProducts(convertedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const getGridClasses = () => {
    switch (gridCols) {
      case "2":
        return "grid-cols-1 sm:grid-cols-2";
      case "3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "4":
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">{title}</h2>
            <div className="flex gap-2">
              {showAddButton && (
                <Link href="/artisan/products/new">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => fetchProducts(true)}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="border-2 border-black rounded-none"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Retry
              </Button>
            </div>
          </div>
        )}
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="flex gap-2">
            {showAddButton && (
              <Link href="/artisan/products/new">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
            <Button
              onClick={() => fetchProducts(true)}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="border-2 border-black rounded-none"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      )}

      <motion.div
        className={`grid ${getGridClasses()} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          Array.from({ length: filters.limit || 8 }).map((_, index) => (
            <motion.div key={`skeleton-${index}`} variants={itemVariants}>
              <ProductCardSkeleton />
            </motion.div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full text-center py-12"
            variants={itemVariants}
          >
            <div className="text-gray-500">
              <p className="text-xl font-medium mb-2">No products found</p>
              <p className="text-sm mb-4">
                {filters.search
                  ? "Try adjusting your search terms"
                  : "Products will appear here when artisans add them"}
              </p>
              {showAddButton && (
                <Link href="/artisan/products/new">
                  <Button
                    variant="default"
                    className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {products.length > 0 && !isLoading && (
        <motion.div
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
          {filters.limit &&
            products.length === filters.limit &&
            " (may be more available)"}
          {isRefreshing && (
            <span className="ml-2 text-blue-600">
              <RefreshCw className="inline h-3 w-3 animate-spin mr-1" />
              Updating...
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
