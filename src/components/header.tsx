"use client"
import Link from "next/link"
import { Palette, Search, ShoppingCart, UserCircle, Package, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60) // Adjust threshold as needed
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "bg-white font-kalam text-black border-b-2 border-black transition-all duration-300",
        isSticky ? "fixed top-0 left-0 right-0 z-50 shadow-md" : "relative",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <div className="border-2 border-black p-1">
              <Palette className="h-8 w-8 text-blue-500" />
            </div>
            <span className="text-2xl font-bold hidden sm:inline">Artisans</span>
          </Link>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for artisan crafts..."
                className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none focus:ring-0 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right: Icons & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-none p-1 sm:p-2 text-sm hover:bg-gray-100">
                  EN <ChevronDown className="h-4 w-4 inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kalam border-2 border-black rounded-none bg-white">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>हिंदी (Hindi)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs sm:text-sm hidden lg:inline">
              Deliver to <span className="font-bold">Uttrakhand</span>
            </span>

            <Link href="/cart" className="p-1 sm:p-2 hover:bg-gray-100 rounded-full" aria-label="Cart">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <Link href="/login" className="p-1 sm:p-2 hover:bg-gray-100 rounded-full" aria-label="Sign In">
              <UserCircle className="h-6 w-6" />
            </Link>
            <Link href="/orders" className="p-1 sm:p-2 hover:bg-gray-100 rounded-full" aria-label="Orders">
              <Package className="h-6 w-6" />
            </Link>
          </div>
        </div>
        {/* Search bar for mobile - shown below main nav items */}
        <div className="md:hidden py-2 px-1">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none focus:ring-0 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
