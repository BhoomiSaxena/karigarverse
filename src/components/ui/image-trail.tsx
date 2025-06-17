"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface TrailImage {
  id: number
  x: number
  y: number
  src: string
}

interface ImageTrailProps {
  children: React.ReactNode
  imageSrcs: string[] // Array of image URLs for the trail
  trailLength?: number
  imageSize?: number
  enabled?: boolean
}

export function ImageTrail({ children, imageSrcs, trailLength = 5, imageSize = 30, enabled = true }: ImageTrailProps) {
  const [trail, setTrail] = useState<TrailImage[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInside, setIsInside] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const currentImageIndexRef = React.useRef(0)

  useEffect(() => {
    currentImageIndexRef.current = currentImageIndex
  }, [currentImageIndex])

  useEffect(() => {
    if (!enabled || !isInside) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      setTrail((prevTrail) => {
        const newTrail = [
          ...prevTrail,
          {
            id: Date.now() + Math.random(), // Unique ID
            x: e.clientX - imageSize / 2, // Adjust for image center
            y: e.clientY - imageSize / 2, // Adjust for image center
            src: imageSrcs[currentImageIndexRef.current % imageSrcs.length],
          },
        ]
        setCurrentImageIndex((prev) => prev + 1)
        return newTrail.slice(-trailLength) // Keep only the last `trailLength` items
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [enabled, isInside, trailLength, imageSrcs, imageSize])

  return (
    <div
      onMouseEnter={() => enabled && setIsInside(true)}
      onMouseLeave={() => enabled && setIsInside(false)}
      className="relative" // Parent needs to be relative for absolute positioning of trail
    >
      {children}
      {enabled && (
        <AnimatePresence>
          {trail.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1 - index / trailLength, // Fade out older images
                scale: 1 - index / trailLength, // Shrink older images
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "fixed", // Use fixed to position relative to viewport
                left: item.x,
                top: item.y,
                width: imageSize,
                height: imageSize,
                pointerEvents: "none", // So trail doesn't interfere with mouse events
                zIndex: 9999, // Ensure trail is on top
              }}
              className="rounded-full overflow-hidden shadow-lg"
            >
              <Image src={item.src || "/placeholder.svg"} alt="trail image" layout="fill" objectFit="cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
