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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/landing">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-md">
                Learn Our Story
              </Button>
            </Link>
            <Link href="/artisan/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-md border-2 border-blue-700">
                🎨 Artisan Dashboard
              </Button>
            </Link>
          </div>
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

          {/* Artisan Call-to-Action Section */}
          <motion.section 
            className="my-20 p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Are You an Artisan?</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our growing community of talented artisans! Showcase your crafts, reach thousands of customers, 
                and grow your business with our comprehensive seller dashboard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Manage Products</h3>
                  <p className="text-gray-600 text-sm">Easy-to-use tools to add, edit, and track your products</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Track Orders</h3>
                  <p className="text-gray-600 text-sm">Monitor sales and manage customer orders efficiently</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">View Analytics</h3>
                  <p className="text-gray-600 text-sm">Get insights on your sales performance and earnings</p>
                </div>
              </div>
              <Link href="/artisan/dashboard">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🎨 Access Artisan Dashboard
                </Button>
              </Link>
            </div>
          </motion.section>

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

        {/* Floating Artisan Dashboard Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/artisan/dashboard">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-500"
            >
              <span className="hidden sm:inline mr-2">🎨 Artisan</span>
              <span className="sm:hidden mr-2">🎨</span>
              Dashboard
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
