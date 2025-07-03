"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  User, 
  Bell,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { artisanNotifications } from "@/lib/data"

const navigation = [
  {
    name: "Dashboard",
    href: "/artisan/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  {
    name: "Products",
    href: "/artisan/products", 
    icon: Package,
    description: "Manage Your Products"
  },
  {
    name: "Orders",
    href: "/artisan/orders",
    icon: ShoppingBag,
    description: "Track & Update Orders"
  },
  {
    name: "Profile",
    href: "/artisan/profile",
    icon: User,
    description: "Account Settings"
  },
  {
    name: "Notifications",
    href: "/artisan/notifications",
    icon: Bell,
    description: "Alerts & Updates",
    badge: artisanNotifications.filter(n => !n.isRead).length
  }
]

interface ArtisanSidebarProps {
  className?: string
}

export function ArtisanSidebar({ className }: ArtisanSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <h2 className="text-2xl font-bold tracking-tight">Artisan Hub</h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-gray-100 transition-colors relative",
                    isActive
                      ? "bg-orange-100 text-orange-900 border-r-4 border-orange-500"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-orange-600" : "text-gray-500")} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Quick Tip</h3>
            </div>
            <p className="text-sm text-orange-700">
              Add high-quality images to increase your product visibility and sales!
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-2 border-black rounded-none justify-start"
            asChild
          >
            <Link href="/login">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
