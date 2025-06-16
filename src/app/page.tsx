import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Palette } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ArtisansMarketplacePage() {
  return (
    <div className="bg-white font-kalam text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b-2 border-black">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <div className="border-2 border-black p-1">
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-lg">
            <Link href="#" className="underline" prefetch={false}>
              HOME
            </Link>
            <Link href="#" prefetch={false}>
              Shop
            </Link>
            <Link href="#" prefetch={false}>
              Artisans
            </Link>
            <Link href="#" prefetch={false}>
              Education
            </Link>
          </nav>
          <Button
            variant="outline"
            className="border-2 border-black rounded-none text-lg px-6 py-2 bg-[#f3f3f3] hover:bg-gray-200"
          >
            Contact Us!
          </Button>
        </header>

        <main className="my-12">
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Artisans_Website__Community_.png-eQsH6wpDZQOtGkbPuPru10SUjGRew0.jpeg"
                alt="Artisan's workshop with various brushes and paints"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Local Artisans
                <br />
                Marketplace
              </h1>
              <p className="text-lg">
                Explore the warmth of handcrafted treasures, bask in the glow of unique stories, and illuminate your
                shopping journey with the brilliance of local talent.
              </p>
              <Button
                variant="outline"
                className="border-2 border-black rounded-none text-lg px-6 py-2 bg-[#f3f3f3] hover:bg-gray-200 flex items-center gap-2"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="my-20">
            <div className="text-center py-4 border-y-2 border-black bg-gray-50 mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
              {products.map((product) => (
                <div key={product.id}>
                  <div className="bg-gray-100 rounded-lg mb-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="rounded-lg object-cover aspect-square"
                    />
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <p className="font-bold">{product.name}</p>
                    <p>{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="#" className="text-lg flex items-center justify-center gap-2" prefetch={false}>
                View All
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>

          {/* Comments Section */}
          <section className="my-20 p-8 border-2 border-black">
            <h2 className="text-4xl font-bold mb-8">Comments</h2>
            <div className="space-y-8">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-4 border-b-2 border-black pb-4 last:border-b-0 last:pb-0"
                >
                  <Avatar className="w-16 h-16 border-2 border-black">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.name} />
                    <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4">
                      <p className="font-bold text-xl">{comment.name}</p>
                      <p className="text-sm text-gray-600">on {comment.date}</p>
                    </div>
                    <p className="text-lg mt-1">"{comment.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="my-20 p-8 border-2 border-black">
            <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
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
        </main>

        {/* Footer */}
        <footer className="py-12 border-t-2 border-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-lg">
            <div>
              <h3 className="font-bold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Artisans
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Education
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Us</h3>
              <address className="not-italic space-y-2">
                <p>Email: info@localartisanmarketplace.com</p>
                <p>Phone: 123-555-XXXX</p>
                <p>Address: 123 Main St, Uttrakhand INDIA</p>
              </address>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Education</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Learn about our Artisans
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Learn about our Products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="underline" prefetch={false}>
                    Learn about our Process
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

const products = [
  { id: 1, name: "Product Name", price: "$10.00", image: "/placeholder.svg?width=500&height=500&text=Art+1" },
  { id: 2, name: "Product Name", price: "$10.00", image: "/placeholder.svg?width=500&height=500&text=Art+2" },
  { id: 3, name: "Product Name", price: "$10.00", image: "/placeholder.svg?width=500&height=500&text=Art+3" },
  { id: 4, name: "Product Name", price: "$10.00", image: "/placeholder.svg?width=500&height=500&text=Art+4" },
]

const comments = [
  {
    id: 1,
    name: "JoshJoe",
    date: "23/03/22",
    text: "Such a delightful collection! Every piece tells a unique story. I love exploring this marketplace!",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Marlyn213",
    date: "28/11/22",
    text: "I've found the perfect addition to my home. The craftsmanship is exceptional, and the shopping experience was seamless.",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "User5323",
    date: "28/07/23",
    text: "This marketplace is a gem! I've already recommended it to friends. Can't wait to see new additions and support more local artisans.",
    avatar: "/placeholder-user.jpg",
  },
]
