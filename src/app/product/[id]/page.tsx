import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products } from "@/lib/data" // Fetch specific product by ID in real app
import Image from "next/image"
import { RatingStars } from "@/components/ui/rating-stars"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Zap, Truck, ShieldCheck } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id) // Find product by ID

  if (!product) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <Link href="/shop" className="text-blue-600 hover:underline mt-4 inline-block">
            Go back to shop
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square relative border-2 border-black/10 rounded-lg overflow-hidden mb-4">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className="aspect-square border-2 border-black/10 hover:border-black rounded-md overflow-hidden relative"
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            {product.artisanName && (
              <p className="text-md text-gray-600">
                Crafted by <span className="font-semibold">{product.artisanName}</span>
              </p>
            )}
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} showReviewCount starSize={20} />

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">₹{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</p>
              )}
            </div>

            <p className="text-sm text-green-600">In Stock ({product.stock} available)</p>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-lg"
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>

            <div className="border-2 border-black/10 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-blue-500" />
                <span>
                  Delivered by <span className="font-semibold">15th Oct</span> (Estimated)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span>Genuine Handcrafted | Quality Assured</span>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 border-2 border-black/10 rounded-lg bg-gray-50 p-0 h-auto">
                <TabsTrigger
                  value="description"
                  className="py-3 data-[state=active]:bg-gray-200 data-[state=active]:shadow-inner rounded-none"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="py-3 data-[state=active]:bg-gray-200 data-[state=active]:shadow-inner rounded-none"
                >
                  Features
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 text-gray-700 text-base leading-relaxed">
                {product.description}
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-base">
                  {product.features?.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="my-16">
            <Separator className="my-8 border-black/20" />
            <h2 className="text-3xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
