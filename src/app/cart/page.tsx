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
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function CartPage() {
  const { t } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );
  const deliveryCharges = subtotal > 1000 ? 0 : 50;
  const total = subtotal + deliveryCharges;

  const handleQuantityUpdate = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
      toast({
        title: t("cart.quantity_updated"),
        description: t("cart.quantity_updated"),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: t("cart.error_updating"),
        description: t("cart.error_updating"),
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: t("cart.removed_from_cart"),
        description: t("cart.removed_from_cart"),
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: t("cart.error_updating"),
        description: t("cart.error_updating"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>{t("cart.loading")}</p>
          </div>
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
          <Link href="/products">
            <Button
              size="lg"
              className="border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 text-lg"
            >
              {t("cart.start_shopping")}
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
          {cartItems.map((item) => {
            const product = item.products;
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-black/10 rounded-lg"
              >
                <div className="w-full sm:w-32 h-32 relative bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-sm text-gray-500">
                    {t("cart.by")} {/* Artisan name if available */}
                  </p>
                  <p className="text-lg font-bold mt-1">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.stock_quantity <= 5 && (
                    <p className="text-sm text-orange-600">
                      {t("cart.limited_stock", {
                        count: product.stock_quantity,
                      })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end justify-between gap-2">
                  <div className="flex items-center gap-2 border-2 border-black/20 rounded-md p-1 w-fit">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-sm hover:bg-gray-200"
                      onClick={() =>
                        handleQuantityUpdate(item.product_id, item.quantity - 1)
                      }
                      disabled={updatingItems.has(item.product_id)}
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
                      onClick={() =>
                        handleQuantityUpdate(item.product_id, item.quantity + 1)
                      }
                      disabled={updatingItems.has(item.product_id)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveItem(item.product_id)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    {t("cart.remove")}
                  </Button>
                </div>
              </div>
            );
          })}
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
