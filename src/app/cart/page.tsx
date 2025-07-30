"use client";

import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 }
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

export default function CartPage() {
  const { t } = useLanguage();
  const { user } = useDatabase();
  const { cartItems, totalItems, totalAmount, updateQuantity, removeFromCart, isLoading } = useCart();
  const router = useRouter();

  // Calculate totals
  const subtotal = totalAmount;
  const deliveryCharges = subtotal > 1000 ? 0 : 50;
  const total = subtotal + deliveryCharges;

  // Handle quantity change
  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(cartItemId, newQuantity);
  };

  // Handle remove item
  const handleRemoveItem = async (cartItemId: string) => {
    await removeFromCart(cartItemId);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
          <motion.div
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={cardVariants}>
              <div className="bg-white border-4 border-black rounded-2xl p-12 shadow-[8px_8px_0px_0px_#000]">
                <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6" />
                <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8 text-lg">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-4 border-black rounded-xl text-xl py-6 px-8 font-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200"
                  >
                    🛍️ Start Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
        <motion.div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={cardVariants}>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/products">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-black rounded-xl hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">
                🛒 Shopping Cart
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingCart className="h-4 w-4" />
              <span>{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 relative bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300">
                      <Image
                        src={item.products?.images?.[0] || "/placeholder.svg"}
                        alt={item.products?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {item.products?.name || "Unknown Product"}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                          In Stock: {item.products?.stock_quantity || 0}
                        </span>
                        {item.products?.is_active && (
                          <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full border border-green-300">
                            ✓ Available
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-4">
                        ₹{(item.products?.price || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex flex-col sm:items-end justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border-2 border-black rounded-xl bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-10 w-10 rounded-l-lg border-r-2 border-black hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="text-lg font-bold w-12 text-center bg-yellow-50">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.products?.stock_quantity || 0)}
                          className="h-10 w-10 rounded-r-lg border-l-2 border-black hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Item Total</p>
                        <p className="text-xl font-bold">
                          ₹{((item.products?.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 rounded-xl"
                      >
                        <Trash2 size={18} className="mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div variants={cardVariants} className="lg:col-span-1">
              <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] sticky top-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  📋 Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal ({totalItems} items):</span>
                    <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-lg">
                    <span>Delivery Charges:</span>
                    <span className={`font-bold ${deliveryCharges === 0 ? 'text-green-600' : ''}`}>
                      {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges.toLocaleString()}`}
                    </span>
                  </div>

                  {subtotal < 1000 && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-200">
                      💡 Add ₹{(1000 - subtotal).toLocaleString()} more for FREE delivery!
                    </div>
                  )}

                  <Separator className="border-gray-300" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{total.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Button
                      size="lg"
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-4 border-black rounded-xl text-xl py-6 font-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200"
                    >
                      🛍️ Proceed to Checkout
                    </Button>

                    <Link href="/products" className="block">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-black rounded-xl text-lg py-4 hover:bg-gray-50"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Security Info */}
                  <div className="mt-6 bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <h3 className="font-bold text-green-800 mb-2">🔒 Secure Checkout</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• SSL encrypted payments</li>
                      <li>• 7-day return policy</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
