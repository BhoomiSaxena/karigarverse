"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const pathNameMap: Record<string, string> = {
  "artisan": "Artisan Hub",
  "dashboard": "Dashboard", 
  "products": "Products",
  "orders": "Orders",
  "profile": "Profile",
  "notifications": "Notifications",
  "new": "Add Product",
  "edit": "Edit Product"
}

interface ArtisanBreadcrumbProps {
  className?: string
}

export function ArtisanBreadcrumb({ className }: ArtisanBreadcrumbProps) {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumb on main dashboard
  if (pathname === '/artisan/dashboard') {
    return null
  }

  const breadcrumbItems = []
  let currentPath = ""

  // Add home/dashboard link
  breadcrumbItems.push({
    label: "Dashboard",
    href: "/artisan/dashboard",
    isLast: false
  })

  // Build breadcrumb from path segments (skip 'artisan' since it's the base)
  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${pathSegments.slice(0, i + 1).join('/')}`
    
    // Skip dynamic segments like [id] for display purposes
    if (segment.startsWith('[') && segment.endsWith(']')) {
      continue
    }
    
    const isLast = i === pathSegments.length - 1
    const label = pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    breadcrumbItems.push({
      label,
      href: isLast ? undefined : currentPath,
      isLast
    })
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-600 mb-6", className)}>
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href && !item.isLast ? (
            <Link 
              href={item.href}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              item.isLast ? "text-gray-900 font-medium" : "text-gray-600"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
