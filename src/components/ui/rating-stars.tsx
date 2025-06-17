import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  maxStars?: number
  starSize?: number
  className?: string
  showReviewCount?: boolean
  reviewCount?: number
}

export function RatingStars({
  rating,
  maxStars = 5,
  starSize = 16,
  className,
  showReviewCount = false,
  reviewCount,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0)

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Rating: ${rating} out of ${maxStars} stars${showReviewCount && reviewCount !== undefined ? `, ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : ""}`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" className="text-yellow-400" size={starSize} />
      ))}
      {halfStar && (
        <Star
          key="half"
          fill="currentColor"
          className="text-yellow-400"
          style={{ clipPath: "inset(0 50% 0 0)" }}
          size={starSize}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="text-gray-300" size={starSize} />
      ))}
      {showReviewCount && reviewCount !== undefined && (
        <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
      )}
    </div>
  )
}
