"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { TCourse } from "@/types/models.types";
import { useUser } from "@clerk/nextjs";

interface WishlistContextType {
  wishlist: TCourse[];
  addToWishlist: (course: TCourse) => void;
  removeFromWishlist: (courseId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState<TCourse[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`wishlist_${user.id}`);
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    }
  }, [user]);

  const addToWishlist = (course: TCourse) => {
    if (!wishlist.some((item) => item._id === course._id)) {
      setWishlist([...wishlist, course]);
      if (user) {
        localStorage.setItem(
          `wishlist_${user.id}`,
          JSON.stringify([...wishlist, course])
        );
      }
    }
  };

  const removeFromWishlist = (courseId: string) => {
    setWishlist(wishlist.filter((item) => item._id !== courseId));
    if (user) {
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(wishlist.filter((item) => item._id !== courseId))
      );
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
