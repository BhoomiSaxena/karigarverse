"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategorySlider } from "@/components/category-slider"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/data"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const productSections = [
  { title: "Deals of the Day", products: products.slice(0, 4) },
  { title: "Top Artisan Picks", products: products.slice(1, 5).reverse() },
  { title: "Inspired by Your Browsing", products: products.slice(2, 6) },
]

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function HomePage() {
  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-orange-100 to-orange-50 py-8 px-4 text-center border-b-2 border-orange-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome to Our Artisan Marketplace</h2>
          <p className="text-gray-600 mb-4">Discover authentic handcrafted treasures from local artisans</p>
          <Link href="/landing">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-md">
              Learn Our Story
            </Button>
          </Link>
        </div>

        <HeroCarousel />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySlider />
          {productSections.map((section, index) => (
            <motion.section
              key={index}
              className="my-12"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{section.title}</h2>
                <Link href="/shop" className="text-lg flex items-center gap-1 hover:underline" prefetch={false}>
                  View All <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.products.map((product) => (
                  <motion.div key={product.id} variants={cardItemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Newsletter Section */}
          <section className="my-20 p-8 border-2 border-black">
            <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">Stay updated with new artisan collections and exclusive offers</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="text-sm">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  className="border-2 border-black rounded-none mt-1"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="border-2 border-black rounded-none text-lg px-8 py-2 bg-[#f3f3f3] hover:bg-gray-200 self-end"
              >
                Subscribe
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
