"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { products } from "@/lib/data"; // Use actual cart items from context/state
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock cart items for now
const cartItems = [
  { ...products[0], quantity: 1 },
  { ...products[1], quantity: 2 },
];

const subtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
const deliveryCharges = subtotal > 1000 ? 0 : 50; // Example logic
const total = subtotal + deliveryCharges;

export default function CartPage() {
  const { t } = useLanguage();

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
                  src={item.images[0] || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">
                  Category: {item.category}
                </p>
                <p className="text-lg font-bold mt-1">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col sm:items-end justify-between gap-2">
                <div className="flex items-center gap-2 border-2 border-black/20 rounded-md p-1 w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-sm hover:bg-gray-200"
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
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
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
              <span>₹{subtotal.toLocaleString()}</span>
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
