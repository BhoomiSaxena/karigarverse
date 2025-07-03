"use client"

import { ArtisanSidebar } from "@/components/artisan-sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArtisanLayoutProps {
  children: React.ReactNode
}

export function ArtisanLayout({ children }: ArtisanLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r-2 border-black">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h2 className="text-xl font-bold">Artisan Hub</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ArtisanSidebar />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 border-r-2 border-black bg-gray-50">
          <ArtisanSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile menu button */}
          <div className="lg:hidden p-4 border-b-2 border-black bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="border-2 border-black rounded-none"
            >
              <Menu className="h-5 w-5 mr-2" />
              Menu
            </Button>
          </div>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
