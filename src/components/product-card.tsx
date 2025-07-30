"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { ShoppingCart, CheckCircle } from "lucide-react"; // Added CheckCircle
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react"; // For button state

interface ProductCardProps {
  product: Product;
  className?: string;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -5, scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" },
};

export function ProductCard({ product, className }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    console.log(`Added ${product.name} to cart`); // Replace with actual cart logic
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cn(
        "group relative border-2 border-black/10 rounded-lg overflow-hidden bg-white flex flex-col justify-between",
        className
      )}
    >
      <div>
        <Link href={`/product/${product.id}`} className="block">
          <div className="aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-bold truncate" title={product.name}>
              {product.name}
            </h3>
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              showReviewCount
              starSize={14}
            />
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold">
                ₹{product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <Button
          variant="outline"
          className={cn(
            "w-full border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 transition-colors duration-200",
            isAdded &&
              "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
          )}
          onClick={handleAddToCart}
          disabled={isAdded}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center"
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Added!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}
