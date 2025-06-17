import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { userOrders } from "@/lib/data"
import type { UserOrder, OrderItem } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge" // Assuming you have shadcn Badge

const getStatusColor = (status: UserOrder["status"]) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700 border-green-300"
    case "Shipped":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "Processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-300"
    case "Cancelled":
      return "bg-red-100 text-red-700 border-red-300"
    default:
      return "bg-gray-100 text-gray-700 border-gray-300"
  }
}

export default function OrdersPage() {
  return (
    <div className="bg-white font-kalam text-black flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Orders</h1>

        {userOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">You have no past orders.</p>
            <Link href="/shop">
              <Button size="lg" className="border-2 border-black rounded-none bg-[#f3f3f3] hover:bg-gray-200 text-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {userOrders.map((order) => (
              <div key={order.id} className="p-6 border-2 border-black/10 rounded-lg bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Order #{order.orderNumber}</h2>
                    <p className="text-sm text-gray-500">Placed on: {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>

                <Separator className="border-black/10 my-3" />

                <div className="space-y-3 mb-3">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-md border border-black/10"
                      />
                      <div className="flex-grow">
                        <Link href={`/product/${item.id}`} className="hover:underline font-medium">
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} | Price: ₹{item.priceAtPurchase.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <Separator className="border-black/10 my-3" />

                <div className="flex justify-between items-center">
                  <p className="text-lg">
                    Shipping to: <span className="font-medium">{order.shippingAddress}</span>
                  </p>
                  <p className="text-xl font-bold">Total: ₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="border-2 border-black rounded-none">
                    View Invoice
                  </Button>
                  {order.status === "Delivered" && (
                    <Button variant="outline" className="border-2 border-black rounded-none">
                      Write a Review
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
  )
}
