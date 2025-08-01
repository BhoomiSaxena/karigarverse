"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ClientDatabaseOperations } from "@/lib/database-client";
import type { Product } from "@/lib/types";

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductsByCategory: (categoryId: string) => Product[];
  getFeaturedProducts: (limit?: number) => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

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
});

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = new ClientDatabaseOperations();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dbProducts = await db.getProducts({
        is_active: true,
        limit: 100, // Get more products for the context
      });

      const convertedProducts = dbProducts.map(convertDatabaseProduct);
      setProducts(convertedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((product) => product.category === categoryId);
  };

  const getFeaturedProducts = (limit: number = 8) => {
    // For now, just return the most recent products
    // In a real implementation, you'd have a featured flag
    return products.slice(0, limit);
  };

  const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  useEffect(() => {
    fetchProducts();

    // Set up periodic refresh to catch new products
    const interval = setInterval(fetchProducts, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: ProductsContextType = {
    products,
    isLoading,
    error,
    refreshProducts,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
