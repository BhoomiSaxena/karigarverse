"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

export default function CartPage() {
  const { t } = useLanguage();
  const {
    cartItems,
    totalItems,
    totalAmount,
    isLoading,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  useEffect(() => {
    refreshCart();
  }, []);

  // Calculate delivery charges and total
  const deliveryCharges = totalAmount > 1000 ? 0 : 50;
  const total = totalAmount + deliveryCharges;

  if (isLoading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Loading your cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold mb-4">{t("cart.empty_title")}</h1>
          <p className="text-gray-600 mb-6">{t("cart.empty_message")}</p>
          <Link href="/shop">
            <Button
              size="lg"
              className="border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 text-lg"
            >
              {t("cart.continue_shopping")}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("cart.title")}
        </h1>

        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-black/10 rounded-lg"
            >
              <div className="w-full sm:w-32 h-32 relative bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={item.products?.images?.[0] || "/placeholder.svg"}
                  alt={item.products?.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">
                  {item.products?.name || "Unknown Product"}
                </h2>
                <p className="text-sm text-gray-500">
                  Product ID: {item.product_id.slice(0, 8)}...
                </p>
                <p className="text-lg font-bold mt-1">
                  ₹{item.products?.price?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="flex flex-col sm:items-end justify-between gap-2">
                <div className="flex items-center gap-2 border-2 border-black/20 rounded-md p-1 w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-sm hover:bg-gray-200"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="text-lg w-8 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-sm hover:bg-gray-200"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={
                      item.quantity >= (item.products?.stock_quantity || 0)
                    }
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={18} className="mr-1" /> {t("cart.remove")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-8 border-black/20" />

        <div className="bg-gray-50 p-6 border-2 border-black/10 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t("cart.order_summary")}</h2>
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span>{t("cart.subtotal")}:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("cart.delivery")}:</span>
              <span>
                {deliveryCharges === 0
                  ? t("cart.free_delivery")
                  : `₹${deliveryCharges.toLocaleString()}`}
              </span>
            </div>
            <Separator className="my-2 border-black/10" />
            <div className="flex justify-between font-bold text-xl">
              <span>{t("cart.total")}:</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <Link href="/checkout" className="block mt-6">
            <Button
              size="lg"
              className="w-full border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3"
            >
              {t("cart.proceed_checkout")}
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
