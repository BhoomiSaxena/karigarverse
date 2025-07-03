"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Package, 
  ShoppingBag, 
  AlertTriangle,
  CheckCircle,
  X,
  MoreHorizontal,
  ArrowLeft,
  Filter,
  Trash2
} from "lucide-react"
import { artisanNotifications } from "@/lib/data"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Notification } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(artisanNotifications)
  const [filterType, setFilterType] = useState("all")
  const [filterRead, setFilterRead] = useState("all")

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesRead = filterRead === "all" || 
                       (filterRead === "unread" && !notification.isRead) ||
                       (filterRead === "read" && notification.isRead)
    
    return matchesType && matchesRead
  })

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-5 w-5 text-green-500" />
      case "product":
        return <Package className="h-5 w-5 text-blue-500" />
      case "general":
        return <Bell className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-green-100 text-green-700"
      case "product":
        return "bg-blue-100 text-blue-700"
      case "general":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/artisan/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-orange-500" />
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600 mt-2">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <Button 
                    onClick={markAllAsRead}
                    variant="outline" 
                    className="border-2 border-black rounded-none"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    onClick={clearAllNotifications}
                    variant="outline" 
                    className="border-2 border-red-500 text-red-600 rounded-none hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-black rounded-none">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Filters:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="flex-1">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="border-2 border-black/20 rounded-none">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black rounded-none">
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="order">Orders</SelectItem>
                          <SelectItem value="product">Products</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Select value={filterRead} onValueChange={setFilterRead}>
                        <SelectTrigger className="border-2 border-black/20 rounded-none">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black rounded-none">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {notifications.length === 0 ? "No notifications" : "No notifications match your filters"}
              </h3>
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? "You're all caught up! New notifications will appear here." 
                  : "Try adjusting your filters to see more notifications."
                }
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredNotifications.map((notification) => (
                <motion.div key={notification.id} variants={itemVariants}>
                  <Card className={`border-2 border-black rounded-none transition-all hover:shadow-lg ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {notification.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getNotificationTypeColor(notification.type)}`}
                              >
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {formatDate(notification.createdAt)}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {notification.actionUrl && (
                                  <Link href={notification.actionUrl}>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-2 border-black rounded-none text-xs"
                                    >
                                      View Details
                                    </Button>
                                  </Link>
                                )}
                                {!notification.isRead && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => markAsRead(notification.id)}
                                    className="border-2 border-green-500 text-green-600 rounded-none text-xs hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
