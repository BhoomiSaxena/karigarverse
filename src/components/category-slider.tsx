"use client"
import Link from "next/link"
import Image from "next/image"
import { categories } from "@/lib/data"
import type { Category } from "@/lib/types"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { motion } from "framer-motion" // Import motion

const categoryItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    // Custom function for staggered delay
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1, // Stagger by 0.1s per item
      duration: 0.3,
    },
  }),
  hover: { scale: 1.05, y: -3, transition: { duration: 0.2 } },
}

export function CategorySlider() {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Explore by Category</h2>
      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {categories.map((category: Category, index: number) => (
            <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <motion.div
                custom={index} // Pass index to custom variant function
                variants={categoryItemVariants}
                initial="hidden"
                whileInView="visible" // Animate when it scrolls into view
                whileHover="hover"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link href={`/shop?category=${category.id}`} className="block group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-black/10 group-hover:border-black/30 transition-colors">
                    {category.image ? (
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : category.icon ? (
                      <category.icon className="w-1/2 h-1/2 text-gray-500 mx-auto my-auto" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-center font-semibold text-lg group-hover:underline">{category.name}</p>
                </Link>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black border-2 border-black rounded-full h-10 w-10 hidden sm:flex" />
        <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black border-2 border-black rounded-full h-10 w-10 hidden sm:flex" />
      </Carousel>
    </div>
  )
}
