"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { clientDb } from "@/lib/database-client";

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { cartItems, clearCart } = useCart();
  const { user } = useDatabase();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    email: user?.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [deliveryOption, setDeliveryOption] = useState<string>("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );
  const deliveryCharges =
    deliveryOption === "express" ? 100 : subtotal > 1000 ? 0 : 50;
  const total = subtotal + deliveryCharges;

  useEffect(() => {
    if (!user) {
      toast({
        title: t("checkout.login_required"),
        description: t("checkout.login_required_desc"),
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }
  }, [user, cartItems, router, t]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = t("checkout.required_field");
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = t("checkout.required_field");
    } else if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = t("checkout.invalid_phone");
    }

    if (!shippingAddress.email.trim()) {
      newErrors.email = t("checkout.required_field");
    } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      newErrors.email = t("checkout.invalid_email");
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = t("checkout.address_required");
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = t("checkout.city_required");
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = t("checkout.state_required");
    }

    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = t("checkout.required_field");
    } else if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) {
      newErrors.postalCode = t("checkout.invalid_postal_code");
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = t("checkout.payment_method_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.products?.price || 0) * item.quantity,
        0
      );
      const taxAmount = subtotal * 0.18; // 18% GST
      const shippingCost = deliveryOption === "express" ? 200 : 100;
      const discountAmount = 0;
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

      // Create order using database client
      const orderData = {
        customer_id: user!.id,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        payment_method: paymentMethod,
        notes: `Delivery option: ${deliveryOption}`,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          artisan_id: item.products?.artisan_id || "", // Need to get this from product
          quantity: item.quantity,
          unit_price: item.products?.price || 0,
        })),
      };

      const result = await clientDb.createOrder(orderData);

      if (result.success && result.data) {
        // Clear cart after successful order
        await clearCart();

        toast({
          title: t("checkout.order_placed"),
          description: t("checkout.thank_you"),
        });

        // Redirect to order confirmation or orders page
        router.push(`/orders?orderId=${result.data.id}`);
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: t("checkout.order_error"),
        description: t("checkout.order_error"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-lg">
                    {t("checkout.full_name")} *
                  </Label>
                  <Input
                    id="fullName"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder={t("checkout.full_name_placeholder")}
                    className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-lg">
                      {t("checkout.phone")} *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.phone_placeholder")}
                      className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-lg">
                      {t("checkout.email")} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.email_placeholder")}
                      className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressLine1" className="text-lg">
                    {t("checkout.address_line_1")} *
                  </Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        addressLine1: e.target.value,
                      }))
                    }
                    placeholder={t("checkout.address_line_1_placeholder")}
                    className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="addressLine2" className="text-lg">
                    {t("checkout.address_line_2")}
                  </Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        addressLine2: e.target.value,
                      }))
                    }
                    placeholder={t("checkout.address_line_2_placeholder")}
                    className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-lg">
                      {t("checkout.city")} *
                    </Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.city_placeholder")}
                      className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-lg">
                      {t("checkout.state")} *
                    </Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.state_placeholder")}
                      className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postalCode" className="text-lg">
                      {t("checkout.postal_code")} *
                    </Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      placeholder={t("checkout.postal_code_placeholder")}
                      className="mt-1 border-2 border-black/20 rounded-none h-11 text-base"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Options */}
            <section className="p-6 border-2 border-black/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                2. {t("checkout.delivery_options")}
              </h2>
              <RadioGroup
                value={deliveryOption}
                onValueChange={setDeliveryOption}
                className="space-y-2"
              >
                <Label
                  htmlFor="standard-delivery"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="standard" id="standard-delivery" />
                  <div>
                    <div className="font-semibold">
                      {t("checkout.standard_delivery")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("checkout.standard_delivery_desc")}
                    </div>
                    <div className="text-sm font-semibold">
                      {subtotal > 1000 ? t("cart.free") : "₹50"}
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="express-delivery"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="express" id="express-delivery" />
                  <div>
                    <div className="font-semibold">
                      {t("checkout.express_delivery")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("checkout.express_delivery_desc")}
                    </div>
                    <div className="text-sm font-semibold">₹100</div>
                  </div>
                </Label>
              </RadioGroup>
            </section>

            {/* Payment Method */}
            <section className="p-6 border-2 border-black/10 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">
                3. {t("checkout.payment_method")}
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-2"
              >
                <Label
                  htmlFor="cod-payment"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="cod" id="cod-payment" />
                  {t("checkout.cash_on_delivery")}
                </Label>
                <Label
                  htmlFor="upi-payment"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="upi" id="upi-payment" />
                  {t("checkout.upi_payment")}
                </Label>
                <Label
                  htmlFor="card-payment"
                  className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-md has-[:checked]:bg-gray-100 has-[:checked]:border-black cursor-pointer"
                >
                  <RadioGroupItem value="card" id="card-payment" />
                  {t("checkout.card_payment")}
                </Label>
              </RadioGroup>
              {errors.paymentMethod && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.paymentMethod}
                </p>
              )}
            </section>
          </div>

          {/* Right Side: Order Summary */}
          <aside className="lg:col-span-1 p-6 border-2 border-black/10 rounded-lg h-fit bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">
              {t("checkout.order_summary")}
            </h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cartItems.map((item) => {
                const product = item.products;
                if (!product) return null;

                return (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md border border-black/10"
                    />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p>
                        {t("checkout.quantity_short")}: {item.quantity}
                      </p>
                      <p>₹{(product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="border-black/10" />
            <div className="space-y-1 mt-3 text-base">
              <div className="flex justify-between">
                <span>{t("checkout.subtotal")}:</span>{" "}
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("checkout.shipping")}:</span>
                <span>
                  {deliveryCharges === 0
                    ? t("cart.free")
                    : `₹${deliveryCharges}`}
                </span>
              </div>
              <Separator className="border-black/10 my-1" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t("checkout.total")}:</span>{" "}
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 border-2 border-black rounded-none bg-yellow-400 hover:bg-yellow-500 text-black text-xl py-3"
            >
              {isProcessing
                ? t("checkout.processing_order")
                : t("checkout.place_order")}
            </Button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
