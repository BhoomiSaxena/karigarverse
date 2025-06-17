import Link from "next/link"
import { Palette, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Footer() {
  return (
    <footer className="bg-gray-50 font-kalam text-black border-t-2 border-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Get to Know Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/mission" className="hover:underline">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect with Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="mailto:info@localartisans.com" className="hover:underline">
                  Email Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Sell with Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sell" className="hover:underline">
                  Become an Artisan
                </Link>
              </li>
              <li>
                <Link href="/seller-portal" className="hover:underline">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:underline">
                  Selling Guidelines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-black/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Palette className="h-6 w-6 text-blue-500" />
            <span>© {new Date().getFullYear()} Local Artisans Marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-none p-1 text-sm hover:bg-gray-100">
                  <img src="/placeholder.svg?width=20&height=15&text=IN" alt="India Flag" className="w-5 h-auto mr-2" />{" "}
                  India <ChevronDown className="h-4 w-4 inline ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
                <DropdownMenuItem>India</DropdownMenuItem>
                {/* Add other countries */}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-none p-1 text-sm hover:bg-gray-100">
                  English <ChevronDown className="h-4 w-4 inline ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>हिंदी (Hindi)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  )
}
