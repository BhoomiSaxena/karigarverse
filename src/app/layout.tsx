import type React from "react"
import type { Metadata } from "next"
import { Kalam } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
})

export const metadata: Metadata = {
  title: "Local Artisans Marketplace",
  description: "Explore handcrafted treasures from local artisans.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", kalam.variable)}>{children}</body>
    </html>
  )
}
