"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientDb } from "@/lib/database-client";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  payment_method: string;
  delivery_option: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      images: string[];
    } | null;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "shipped":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    case "pending":
      return "bg-orange-100 text-orange-700 border-orange-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const { user } = useDatabase();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await clientDb.getUserOrders(user.id);

        if (result.success && result.data) {
          setOrders(result.data);
        } else {
          setError(result.error || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>{t("orders.loading_orders")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {t("orders.error_loading_orders")}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
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
          {t("orders.title")}
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              {t("orders.no_orders")}
            </p>
            <Link href="/products">
              <Button
                size="lg"
                className="border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 text-lg"
              >
                {t("orders.start_shopping")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border-2 border-black/10 rounded-lg p-6 bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {t("orders.order_number")} #
                      {order.id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-gray-600">
                      {t("orders.placed_on")} {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {t(`orders.status.${order.status.toLowerCase()}`)}
                    </Badge>
                    <span className="text-lg font-bold">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Separator className="my-4 border-black/10" />

                <div className="space-y-3">
                  {order.order_items.map((item) => {
                    const product = item.products;
                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex gap-4">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="rounded-md border border-black/10"
                        />
                        <div className="flex-grow">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-gray-600">
                            {t("orders.quantity")}: {item.quantity}
                          </p>
                          <p className="font-semibold">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-black rounded-none bg-white hover:bg-gray-100"
                  >
                    {t("orders.view_details")}
                  </Button>
                  {order.status.toLowerCase() === "delivered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-black rounded-none bg-white hover:bg-gray-100"
                    >
                      {t("orders.write_review")}
                    </Button>
                  )}
                  {["pending", "processing"].includes(
                    order.status.toLowerCase()
                  ) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {t("orders.cancel_order")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
