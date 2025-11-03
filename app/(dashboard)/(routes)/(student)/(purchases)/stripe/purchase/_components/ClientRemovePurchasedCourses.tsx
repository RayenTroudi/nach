"use client";
import { useCart } from "@/contexts/CartContext";

const ClientRemovePurchasedCourses = () => {
  const { removeFromCart, cartItems } = useCart();

  const removePurchasedCourses = () => {
    for (const item of cartItems) {
      removeFromCart(item._id);
    }
  };

  removePurchasedCourses();

  return null;
};

export default ClientRemovePurchasedCourses;
