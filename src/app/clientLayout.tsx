"use client" // Required for AnimatePresence and motion components at the root
import type React from "react"
// Keep existing imports: Kalam, cn
import { Kalam } from "next/font/google"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation" // To get current path for key

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", kalam.variable)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname} // Unique key for each route
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
