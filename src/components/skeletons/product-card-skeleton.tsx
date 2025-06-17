"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function ProductCardSkeleton() {
  return (
    <motion.div
      className={cn(
        "group relative border-2 border-black/10 rounded-lg overflow-hidden bg-gray-100 flex flex-col justify-between animate-pulse",
      )}
    >
      <div className="aspect-square w-full h-full"></div>
      <div className="p-4 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-baseline gap-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <div className="w-full h-10 bg-gray-200 rounded"></div>
      </div>
    </motion.div>
  )
}
