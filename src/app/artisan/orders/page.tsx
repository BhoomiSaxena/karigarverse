"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  MoreHorizontal,
  Mail,
  Phone
} from "lucide-react"
import { artisanOrders } from "@/lib/data"
import Image from "next/image"
import { motion } from "framer-motion"
import type { ArtisanOrder } from "@/lib/types"

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

export default function OrdersManagement() {
  const [orders, setOrders] = useState<ArtisanOrder[]>(artisanOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<ArtisanOrder | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || order.status.toLowerCase() === filterStatus.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId: string, newStatus: ArtisanOrder["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-300"
      case "Shipped":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      case "Shipped":
        return <Truck className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    totalEarnings: orders.reduce((sum, o) => sum + o.totalAmount, 0)
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-green-500" />
                  Order Management
                </h1>
                <p className="text-gray-600 mt-2">Track and manage your incoming orders</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.total}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Shipped</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{orderStats.shipped}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{orderStats.totalEarnings.toLocaleString()}</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="bg-gray-50 p-6 border-2 border-black rounded-none mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by order number, buyer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-black rounded-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-black rounded-none mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-kalam border-2 border-black rounded-none">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="border-2 border-black rounded-none w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Orders List */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredOrders.map((order) => (
              <motion.div key={order.id} variants={itemVariants}>
                <Card className="border-2 border-black rounded-none hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Product Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start gap-4">
                          <Image
                            src={order.productImage || "/placeholder.svg"}
                            alt={order.productName}
                            width={80}
                            height={80}
                            className="rounded-md border border-gray-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                <p className="text-gray-600">{order.productName}</p>
                                <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                              </div>
                              <Badge className={`${getStatusColor(order.status)} border`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </span>
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Ordered: {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                              {order.estimatedDelivery && (
                                <p className="flex items-center gap-1">
                                  <Truck className="h-4 w-4" />
                                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium mb-2">Customer Details</h4>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {order.buyerEmail}
                          </p>
                          <p className="text-gray-600 flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{order.shippingAddress}</span>
                          </p>
                        </div>
                      </div>

                      {/* Order Summary & Actions */}
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Order Summary</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Price per item:</span>
                              <span>₹{order.pricePerItem.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span>{order.quantity}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-2 border-black rounded-none"
                                onClick={() => setSelectedOrder(order)}
                              >
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="font-kalam border-2 border-black rounded-none">
                              <DialogHeader>
                                <DialogTitle>Update Order Status</DialogTitle>
                                <DialogDescription>
                                  Change the status for order {order.orderNumber}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Current Status: {order.status}</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {["Pending", "Shipped", "Delivered", "Cancelled"].map((status) => (
                                    <Button
                                      key={status}
                                      variant={order.status === status ? "default" : "outline"}
                                      size="sm"
                                      className="border-2 border-black rounded-none"
                                      onClick={() => {
                                        updateOrderStatus(order.id, status as ArtisanOrder["status"])
                                        setSelectedOrder(null)
                                      }}
                                    >
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(status)}
                                        {status}
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-2 border-black rounded-none"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredOrders.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your filters to see more orders."
                  : "You haven't received any orders yet. Keep promoting your products!"
                }
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
