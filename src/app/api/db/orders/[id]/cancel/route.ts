import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import {
  handleError,
  withAuth,
  AuthenticatedRequest,
} from "@/lib/api-middleware";

export const POST = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const userId = request.user!.id;

      // First, verify that the order belongs to the user
      const order = await db.getOrderById(id);

      if (order.customer_id !== userId) {
        return NextResponse.json(
          { error: "Unauthorized: Order does not belong to user" },
          { status: 403 }
        );
      }

      // Check if order can be cancelled (only pending or processing orders)
      if (!["pending", "processing"].includes(order.status.toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Order cannot be cancelled. Only pending or processing orders can be cancelled.",
          },
          { status: 400 }
        );
      }

      const cancelledOrder = await db.cancelOrder(id);
      return NextResponse.json({ data: cancelledOrder });
    } catch (error) {
      return handleError(error);
    }
  }
);
