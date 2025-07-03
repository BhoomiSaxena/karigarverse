"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Lightbulb, 
  Package, 
  Camera,
  Star,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const welcomeSteps = [
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Add your shop details, bio, and contact information to build trust with customers.",
    icon: Star,
    action: "Complete Profile",
    href: "/artisan/profile",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    id: "product",
    title: "Add Your First Product",
    description: "Showcase your craftsmanship by adding products with high-quality images.",
    icon: Package,
    action: "Add Product",
    href: "/artisan/products/new",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    id: "photos",
    title: "Upload Quality Photos",
    description: "Good photos increase sales by 70%! Use natural lighting and multiple angles.",
    icon: Camera,
    action: "Learn More",
    href: "#",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    id: "analytics",
    title: "Track Your Performance",
    description: "Monitor your sales, views, and customer engagement from your dashboard.",
    icon: TrendingUp,
    action: "View Dashboard",
    href: "/artisan/dashboard",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  }
]

interface ArtisanWelcomeGuideProps {
  className?: string
}

export function ArtisanWelcomeGuide({ className }: ArtisanWelcomeGuideProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('artisan-welcome-guide-seen')
    const completed = JSON.parse(localStorage.getItem('artisan-welcome-steps') || '[]')
    
    setCompletedSteps(completed)
    
    if (!hasSeenGuide) {
      setIsVisible(true)
    }
  }, [])

  const closeGuide = () => {
    setIsVisible(false)
    localStorage.setItem('artisan-welcome-guide-seen', 'true')
  }

  const markStepCompleted = (stepId: string) => {
    const newCompleted = [...completedSteps, stepId]
    setCompletedSteps(newCompleted)
    localStorage.setItem('artisan-welcome-steps', JSON.stringify(newCompleted))
  }

  const progress = (completedSteps.length / welcomeSteps.length) * 100

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-orange-500" />
                <div>
                  <CardTitle className="text-xl text-orange-800">Welcome to Artisan Hub!</CardTitle>
                  <CardDescription className="text-orange-600">
                    Get started with these simple steps to maximize your success
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeGuide}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700">
                  Progress: {completedSteps.length}/{welcomeSteps.length} completed
                </span>
                <Badge className="bg-orange-500 text-white">
                  {Math.round(progress)}%
                </Badge>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {welcomeSteps.map((step) => {
                const isCompleted = completedSteps.includes(step.id)
                const Icon = step.icon
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${step.bgColor}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Icon className={`h-5 w-5 ${step.color}`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {step.title}
                          {isCompleted && (
                            <Badge className="ml-2 bg-green-500 text-white text-xs">
                              ✓ Done
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {step.description}
                        </p>
                        
                        {!isCompleted && (
                          <Link href={step.href}>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="border-2 border-black rounded-none text-xs"
                              onClick={() => markStepCompleted(step.id)}
                            >
                              {step.action}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            
            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-100 border-2 border-green-200 rounded-lg text-center"
              >
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-green-800 mb-1">Congratulations!</h3>
                <p className="text-sm text-green-700">
                  You've completed all the setup steps. You're ready to start selling! 🎉
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
