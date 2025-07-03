"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  Save,
  ArrowLeft
} from "lucide-react"
import { categories, artisanProducts } from "@/lib/data"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { ArtisanProduct } from "@/lib/types"

interface ProductFormData {
  name: string
  description: string
  price: string
  originalPrice: string
  category: string
  stock: string
  images: string[]
  features: string[]
  tags: string[]
}

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

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newFeature, setNewFeature] = useState("")
  const [newTag, setNewTag] = useState("")
  const [imagePreview, setImagePreview] = useState<string>("")

  // Find the product to edit
  const product = artisanProducts.find(p => p.id === params.id)

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price.toString() || "",
    originalPrice: product?.originalPrice?.toString() || "",
    category: product?.category || "",
    stock: product?.stock.toString() || "",
    images: product?.images || [],
    features: product?.features || [],
    tags: product?.tags || []
  })

  useEffect(() => {
    if (!product) {
      // Redirect if product not found
      router.push('/artisan/products')
    }
  }, [product, router])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const addImage = () => {
    if (imagePreview) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imagePreview]
      }))
      setImagePreview("")
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
      alert("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log("Updated Product Data:", formData)
    
    // In a real app, you would make an API call here
    // await updateProduct(params.id, formData)
    
    setIsLoading(false)
    router.push('/artisan/products')
  }

  if (!product) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link href="/artisan/products">
              <Button className="border-2 border-black rounded-none bg-gray-100 hover:bg-gray-200">
                Back to Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
                href="/artisan/products"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Products
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
            </div>
            <p className="text-gray-600 mt-2">Update your product information and make it shine!</p>
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit}
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Basic Information */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Update the essential details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., Handcrafted Ceramic Vase"
                        className="mt-1 border-2 border-black/20 rounded-none h-12"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-base font-medium">
                        Category *
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="mt-1 border-2 border-black/20 rounded-none h-12">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black rounded-none">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-base font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your product in detail..."
                      className="mt-1 border-2 border-black/20 rounded-none min-h-[120px]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing & Inventory */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Pricing & Inventory
                  </CardTitle>
                  <CardDescription>
                    Set your product pricing and stock information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="price" className="text-base font-medium">
                        Selling Price (₹) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="750"
                        className="mt-1 border-2 border-black/20 rounded-none h-12"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="text-base font-medium">
                        Original Price (₹)
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        placeholder="900"
                        className="mt-1 border-2 border-black/20 rounded-none h-12"
                      />
                      <p className="text-sm text-gray-500 mt-1">Optional: Show discount</p>
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-base font-medium">
                        Stock Quantity *
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange("stock", e.target.value)}
                        placeholder="10"
                        className="mt-1 border-2 border-black/20 rounded-none h-12"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Images */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-purple-500" />
                    Product Images
                  </CardTitle>
                  <CardDescription>
                    Update your product images (first image will be the main image)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          width={150}
                          height={150}
                          className="object-cover rounded-lg border-2 border-black/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Input
                      value={imagePreview}
                      onChange={(e) => setImagePreview(e.target.value)}
                      placeholder="Image URL or upload new image"
                      className="border-2 border-black/20 rounded-none h-12"
                    />
                    <Button
                      type="button"
                      onClick={addImage}
                      variant="outline"
                      className="border-2 border-black rounded-none whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-500" />
                    Product Features
                  </CardTitle>
                  <CardDescription>
                    Highlight key features and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="border-2 border-black/20 text-sm px-3 py-1 flex items-center gap-2"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="e.g., Handmade, Premium Quality"
                      className="border-2 border-black/20 rounded-none h-12"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      className="border-2 border-black rounded-none whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-pink-500" />
                    Product Tags
                  </CardTitle>
                  <CardDescription>
                    Add tags to help customers find your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        className="bg-blue-100 text-blue-700 text-sm px-3 py-1 flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g., decor, ceramic, handmade"
                      className="border-2 border-black/20 rounded-none h-12"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                      className="border-2 border-black rounded-none whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black rounded-none h-12 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Product...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Product
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/artisan/products')}
                className="flex-1 border-2 border-black rounded-none h-12 text-lg"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
