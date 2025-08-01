"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ClientDatabaseOperations } from "@/lib/database-client-postgres";
import { useDatabase } from "./DatabaseContext";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
    is_active: boolean;
    artisan_id: string;
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useDatabase();
  const { toast } = useToast();

  // Create database instance
  const clientDb = new ClientDatabaseOperations();

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    if (!item.products) return sum;
    return sum + item.products.price * item.quantity;
  }, 0);

  // Load cart items when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const items = await clientDb.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      await clientDb.addToCart(user.id, productId, quantity);
      await refreshCart(); // Refresh cart to get updated data
      toast({
        title: "🎉 Added to Cart!",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      // Find the cart item to get the product_id
      const cartItem = cartItems.find((item) => item.id === cartItemId);
      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      await clientDb.updateCartItemQuantity(cartItem.product_id, quantity);
      await refreshCart(); // Refresh cart to get updated data
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      // Find the cart item to get the product_id
      const cartItem = cartItems.find((item) => item.id === cartItemId);
      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      await clientDb.removeFromCart(user!.id, cartItem.product_id);
      await refreshCart(); // Refresh cart to get updated data
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      // Remove all items one by one using product_id
      const promises = cartItems.map((item) =>
        clientDb.removeFromCart(user!.id, item.product_id)
      );
      await Promise.all(promises);
      await refreshCart();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const value: CartContextType = {
    cartItems,
    totalItems,
    totalAmount,
    isLoading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
