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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package,
  TrendingUp,
  IndianRupee,
  MoreHorizontal
} from "lucide-react"
import { artisanProducts, categories } from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { ArtisanProduct } from "@/lib/types"

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

export default function ProductsManagement() {
  const [products, setProducts] = useState<ArtisanProduct[]>(artisanProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category === filterCategory
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && product.isActive) ||
                         (filterStatus === "inactive" && !product.isActive)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isActive: !product.isActive }
        : product
    ))
  }

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId))
  }

  const getStockStatus = (stock: number = 0) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-700" }
    if (stock <= 5) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-700" }
    return { text: "In Stock", color: "bg-green-100 text-green-700" }
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
                  <Package className="h-8 w-8 text-blue-500" />
                  Product Management
                </h1>
                <p className="text-gray-600 mt-2">Manage your artisan products and inventory</p>
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                asChild
              >
                <Link href="/artisan/products/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Product
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.isActive).length}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + p.sales, 0)}
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-black rounded-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Filter by Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-2 border-black rounded-none mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-kalam border-2 border-black rounded-none">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-black rounded-none mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-kalam border-2 border-black rounded-none">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="border-2 border-black rounded-none w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterCategory("all")
                    setFilterStatus("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              
              return (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card className="border-2 border-black rounded-none hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge 
                          className={`${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={stockStatus.color}>
                          {stockStatus.text}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>{product.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>{product.sales} sales</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-purple-500" />
                          <span>{product.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4 text-orange-500" />
                          <span>₹{(product.price * product.sales).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/artisan/products/${product.id}/edit`} className="flex-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-2 border-black rounded-none"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id)}
                          className="border-2 border-black rounded-none"
                        >
                          {product.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-none"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="font-kalam border-2 border-black rounded-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the product
                                "{product.name}" from your store.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-2 border-black rounded-none">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-500 hover:bg-red-600 border-2 border-black rounded-none"
                              >
                                Delete Product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {filteredProducts.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your filters to see more products."
                  : "Start by adding your first product to your store."
                }
              </p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-none"
                asChild
              >
                <Link href="/artisan/products/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
