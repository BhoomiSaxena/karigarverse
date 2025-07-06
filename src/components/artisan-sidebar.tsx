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
import { useLanguage } from "@/contexts/LanguageContext"

const navigation = [
  {
    nameKey: "artisan.dashboard",
    href: "/artisan/dashboard",
    icon: LayoutDashboard,
    descriptionKey: "artisan.overview_analytics"
  },
  {
    nameKey: "artisan.products",
    href: "/artisan/products", 
    icon: Package,
    descriptionKey: "artisan.manage_your_products"
  },
  {
    nameKey: "artisan.orders",
    href: "/artisan/orders",
    icon: ShoppingBag,
    descriptionKey: "artisan.track_update_orders"
  },
  {
    nameKey: "artisan.profile",
    href: "/artisan/profile",
    icon: User,
    descriptionKey: "artisan.account_settings"
  },
  {
    nameKey: "artisan.notifications",
    href: "/artisan/notifications",
    icon: Bell,
    descriptionKey: "artisan.alerts_updates",
    badge: artisanNotifications.filter(n => !n.isRead).length
  }
]

interface ArtisanSidebarProps {
  className?: string
}

export function ArtisanSidebar({ className }: ArtisanSidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <h2 className="text-2xl font-bold tracking-tight">{t('artisan.artisan_hub')}</h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.nameKey}
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
                      <span>{t(item.nameKey)}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t(item.descriptionKey)}</p>
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
              <h3 className="font-semibold text-orange-800">{t('artisan.quick_tip')}</h3>
            </div>
            <p className="text-sm text-orange-700">
              {t('artisan.quick_tip_text')}
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-2 border-black rounded-none justify-start"
            asChild
          >
            <Link href="/login">
              <LogOut className="h-4 w-4 mr-2" />
              {t('artisan.sign_out')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
