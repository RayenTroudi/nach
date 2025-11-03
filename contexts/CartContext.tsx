"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { TCourse } from "@/types/models.types";
import { useUser } from "@clerk/nextjs";

interface CartContextType {
  cartItems: TCourse[];
  addToCart: (item: TCourse) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
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
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<TCourse[]>([]);

  useEffect(() => {
    if (user) {
      const storedCart = localStorage.getItem(`cart_${user.id}`);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
    }
  }, [user]);

  const updateCart = useCallback(
    (updatedCart: TCourse[]) => {
      if (user) {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
      }
      setCartItems(updatedCart);
    },
    [user]
  );

  const addToCart = useCallback(
    (item: TCourse) => {
      const isItemInCart = cartItems.some(
        (cartItem) => cartItem._id === item._id
      );
      if (!isItemInCart) {
        updateCart([...cartItems, item]);
      } else {
        console.log("Item is already in the cart:", item);
      }
    },
    [cartItems, updateCart]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      updateCart(cartItems.filter((item) => item._id !== itemId));
    },
    [cartItems, updateCart]
  );

  const clearCart = useCallback(() => {
    updateCart([]);
  }, [updateCart]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
