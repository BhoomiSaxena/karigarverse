"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { clientDb } from "@/lib/database-client";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface OrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "upi" | "cod";
  deliveryOption: "standard" | "express";
  orderNotes?: string;
}

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

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, profile } = useDatabase();
  const { cartItems, totalItems, totalAmount, clearCart } = useCart();
  const { toast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("cod");
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [orderNotes, setOrderNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form with user data
  useEffect(() => {
    if (profile) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: profile.full_name || `${profile.first_name} ${profile.last_name}`,
        email: profile.email || "",
        phone: profile.phone || "",
      }));
    }
  }, [profile]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      router.push("/cart");
    }
  }, [cartItems, isLoading, router, toast]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout.",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, router, toast]);

  // Calculate totals
  const deliveryCharges = deliveryOption === "express" ? 100 : 50;
  const subtotal = totalAmount;
  const finalTotal = subtotal + deliveryCharges;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingAddress.email.trim()) errors.email = "Email is required";
    if (!shippingAddress.phone.trim()) errors.phone = "Phone number is required";
    if (!shippingAddress.address.trim()) errors.address = "Address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (!shippingAddress.state.trim()) errors.state = "State is required";
    if (!shippingAddress.pincode.trim()) errors.pincode = "Pincode is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (shippingAddress.phone && !phoneRegex.test(shippingAddress.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (shippingAddress.pincode && !pincodeRegex.test(shippingAddress.pincode)) {
      errors.pincode = "Please enter a valid 6-digit pincode";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Create order in database
  const createOrder = async (orderData: OrderData): Promise<string> => {
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create order in database
      const order = {
        customer_id: user!.id,
        order_number: orderNumber,
        status: "pending",
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        payment_method: paymentMethod,
        subtotal: subtotal,
        shipping_cost: deliveryCharges,
        total_amount: finalTotal,
        shipping_address: orderData.shippingAddress,
        notes: orderData.orderNotes || null,
      };

      // Here you would call your order creation API
      // For now, we'll simulate the order creation
      console.log("Creating order:", order);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return orderNumber;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData: OrderData = {
        shippingAddress,
        paymentMethod,
        deliveryOption,
        orderNotes: orderNotes || undefined,
      };

      const orderNumber = await createOrder(orderData);

      // Clear cart after successful order
      await clearCart();

      // Show success message
      toast({
        title: "🎉 Order Placed Successfully!",
        description: `Your order ${orderNumber} has been placed successfully.`,
      });

      // Redirect to order confirmation or orders page
      router.push(`/orders?success=true&order=${orderNumber}`);

    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Don't render if user is not logged in or cart is empty
  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 font-[family-name:var(--font-kalam)]">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={cardVariants}>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/cart">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-black rounded-xl hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">
                🛍️ Checkout
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingBag className="h-4 w-4" />
              <span>{totalItems} items in cart • ₹{finalTotal.toLocaleString()} total</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <motion.div variants={cardVariants}>
                <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <MapPin className="h-6 w-6 text-blue-600" />
                      1. Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-base font-bold">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) => handleAddressChange("fullName", e.target.value)}
                          className={`mt-1 border-2 rounded-xl h-11 ${
                            formErrors.fullName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your full name"
                        />
                        {formErrors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-base font-bold">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => handleAddressChange("phone", e.target.value)}
                          className={`mt-1 border-2 rounded-xl h-11 ${
                            formErrors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="10-digit mobile number"
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-base font-bold">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange("email", e.target.value)}
                        className={`mt-1 border-2 rounded-xl h-11 ${
                          formErrors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your email address"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-base font-bold">
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => handleAddressChange("address", e.target.value)}
                        className={`mt-1 border-2 rounded-xl ${
                          formErrors.address ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="House No, Building, Street, Area"
                        rows={3}
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-base font-bold">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                          className={`mt-1 border-2 rounded-xl h-11 ${
                            formErrors.city ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="City"
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-base font-bold">
                          State *
                        </Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleAddressChange("state", e.target.value)}
                          className={`mt-1 border-2 rounded-xl h-11 ${
                            formErrors.state ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="State"
                        />
                        {formErrors.state && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-base font-bold">
                          Pincode *
                        </Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => handleAddressChange("pincode", e.target.value)}
                          className={`mt-1 border-2 rounded-xl h-11 ${
                            formErrors.pincode ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="6-digit pincode"
                        />
                        {formErrors.pincode && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="landmark" className="text-base font-bold">
                        Landmark (Optional)
                      </Label>
                      <Input
                        id="landmark"
                        value={shippingAddress.landmark}
                        onChange={(e) => handleAddressChange("landmark", e.target.value)}
                        className="mt-1 border-2 border-gray-300 rounded-xl h-11"
                        placeholder="Nearby landmark"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Delivery Options */}
              <motion.div variants={cardVariants}>
                <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Truck className="h-6 w-6 text-green-600" />
                      2. Delivery Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={deliveryOption} 
                      onValueChange={(value: "standard" | "express") => setDeliveryOption(value)}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="standard-delivery"
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl has-[:checked]:bg-green-50 has-[:checked]:border-green-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard-delivery" />
                          <div>
                            <p className="font-bold">Standard Delivery</p>
                            <p className="text-sm text-gray-600">5-7 business days</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">₹50</span>
                      </Label>
                      <Label
                        htmlFor="express-delivery"
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl has-[:checked]:bg-green-50 has-[:checked]:border-green-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express-delivery" />
                          <div>
                            <p className="font-bold">Express Delivery</p>
                            <p className="text-sm text-gray-600">2-3 business days</p>
                          </div>
                        </div>
                        <span className="font-bold text-orange-600">₹100</span>
                      </Label>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={cardVariants}>
                <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      3. Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={(value: "card" | "upi" | "cod") => setPaymentMethod(value)}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="cod-payment"
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="cod" id="cod-payment" />
                          <div>
                            <p className="font-bold">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive</p>
                          </div>
                        </div>
                        <span className="text-2xl">💵</span>
                      </Label>
                      <Label
                        htmlFor="upi-payment"
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="upi" id="upi-payment" />
                          <div>
                            <p className="font-bold">UPI Payment</p>
                            <p className="text-sm text-gray-600">Pay via UPI apps</p>
                          </div>
                        </div>
                        <span className="text-2xl">📱</span>
                      </Label>
                      <Label
                        htmlFor="card-payment"
                        className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="card" id="card-payment" />
                          <div>
                            <p className="font-bold">Credit/Debit Card</p>
                            <p className="text-sm text-gray-600">Secure card payment</p>
                          </div>
                        </div>
                        <span className="text-2xl">💳</span>
                      </Label>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Notes */}
              <motion.div variants={cardVariants}>
                <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      📝 Order Notes (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="border-2 border-gray-300 rounded-xl"
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Side: Order Summary */}
            <motion.div variants={cardVariants} className="lg:col-span-1">
              <Card className="border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_#000] sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    🛍️ Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item.products?.images?.[0] || "/placeholder.svg"}
                            alt={item.products?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm line-clamp-2">
                            {item.products?.name || "Unknown Product"}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-bold">
                              ₹{((item.products?.price || 0) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="border-gray-300" />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-base">
                      <span>Subtotal ({totalItems} items):</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Delivery Charges:</span>
                      <span className={deliveryOption === "express" ? "text-orange-600" : "text-green-600"}>
                        ₹{deliveryCharges}
                      </span>
                    </div>
                    <Separator className="border-gray-300" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-green-50 p-3 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-green-800">Secure Checkout</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• SSL encrypted payment</li>
                      <li>• Money-back guarantee</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessingOrder || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-4 border-black rounded-xl text-xl py-6 font-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_#000]"
                  >
                    {isProcessingOrder ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 mr-3" />
                        Place Order • ₹{finalTotal.toLocaleString()}
                      </>
                    )}
                  </Button>

                  {/* Return Policy */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By placing this order, you agree to our{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
