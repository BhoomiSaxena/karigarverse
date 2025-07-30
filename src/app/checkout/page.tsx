"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { products } from "@/lib/data"; // Mock data
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock cart items for summary
const orderItems = [
  { ...products[0], quantity: 1 },
  { ...products[1], quantity: 2 },
];
const orderTotal =
  orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 50; // +50 for shipping

export default function CheckoutPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("checkout.title")}
        </h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side: Address, Delivery, Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Section */}
            <section className="p-6 border-2 border-black/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                1. {t("checkout.shipping_address")}
              </h2>
              {/* Form for new address or selection of saved addresses */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName" className="text-lg">
                    {t("checkout.full_name")}
                  </Label>
                  <Input
                    id="fullName"
                    className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                  />
                </div>
                {/* More address fields: Street, City, State, Zip, Phone */}
              </div>
              <Button
                variant="outline"
                className="mt-4 border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200"
              >
                {t("checkout.save_address")}
              </Button>
            </section>

            {/* Delivery Options */}
            <section className="p-6 border-2 border-black/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                2. {t("checkout.delivery_options")}
              </h2>
              <RadioGroup defaultValue="standard" className="space-y-2">
                <Label
                  htmlFor="standard-delivery"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="standard" id="standard-delivery" />
                  {t("checkout.standard_delivery")} - ₹50
                </Label>
                <Label
                  htmlFor="express-delivery"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="express" id="express-delivery" />
                  {t("checkout.express_delivery")} - ₹100
                </Label>
              </RadioGroup>
            </section>

            {/* Payment Method */}
            <section className="p-6 border-2 border-black/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                3. {t("checkout.payment_method")}
              </h2>
              <RadioGroup defaultValue="card" className="space-y-2">
                {/* Options: Card, UPI, Cash on Delivery */}
                <Label
                  htmlFor="card-payment"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="card" id="card-payment" />
                  {t("checkout.credit_debit_card")}
                </Label>
                {/* Card details form would appear here if selected */}
              </RadioGroup>
            </section>
          </div>

          {/* Right Side: Order Summary */}
          <aside className="lg:col-span-1 p-6 border-2 border-black/10 rounded-lg h-fit bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">
              {t("checkout.order_summary")}
            </h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <Image
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md border border-black/10"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>
                      {t("checkout.quantity_short")}: {item.quantity}
                    </p>
                    <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="border-black/10" />
            <div className="space-y-1 mt-3 text-base">
              <div className="flex justify-between">
                <span>{t("checkout.subtotal")}:</span>{" "}
                <span>₹{(orderTotal - 50).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("checkout.shipping")}:</span> <span>₹50</span>
              </div>
              <Separator className="border-black/10 my-1" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t("checkout.total")}:</span>{" "}
                <span>₹{orderTotal.toLocaleString()}</span>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full mt-6 border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3"
            >
              {t("checkout.confirm_order")}
            </Button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
