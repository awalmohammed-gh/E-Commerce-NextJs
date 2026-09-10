"use client";

import { products } from "@/data/images/data";
import { createContext, useContext, useMemo, useState } from "react";

const EcommerceContext = createContext();

export const EcommerceContextProvider = ({ children }) => {
  const [addItems, setAddItems] = useState({});

  // Add one to quantity
  const handleAddToCart = (productId, size) => {
    setAddItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: (prev[productId]?.[size] || 0) + 1,
      },
    }));
  };

  // Subtract one (never below 0)
  const handleRemoveFromCart = (productId, size) => {
    setAddItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: Math.max(0, (prev[productId]?.[size] || 0) - 1),
      },
    }));
  };

  //Set quantity to an exact number (used by "update" input)
  const updateItemQuantity = (productId, size, quantity) => {
    setAddItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: Math.max(0, quantity),
      },
    }));
  };

  //PURE getter — reads only, never sets state
  const getItemQuantity = (productId, size) => {
    return addItems?.[productId]?.[size] ?? 0;
  };

  // Total number of items in cart
  const handleCartCount = () => {
    let count = 0;
    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        count += addItems[productId][size];
      }
    }
    return count;
  };

  // Total price
  const totalAmount = useMemo(() => {
    let total = 0;
    for (const productId in addItems) {
      const product = products.find((item) => item._id === productId);
      if (product) {
        for (const size in addItems[productId]) {
          total += product.price * addItems[productId][size];
        }
      }
    }
    return total;
  }, [addItems]);

  // Delete an entire product (all sizes)
  const deleteItemFromCart = (productId, size) => {
    setAddItems((prev) => {
      const updatedCart = { ...prev };

      delete updatedCart[productId][size];

      if (Object.keys(updatedCart[productId]).length === 0) {
        delete updatedCart[productId];
      }

      return updatedCart;
    });
  };

  const commerceValue = {
    addItems,
    handleAddToCart,
    handleRemoveFromCart,
    getItemQuantity,
    updateItemQuantity,
    handleCartCount,
    deleteItemFromCart,
    totalAmount,
  };

  return (
    <EcommerceContext.Provider value={commerceValue}>
      {children}
    </EcommerceContext.Provider>
  );
};

export const useEcommerce = () => {
  return useContext(EcommerceContext);
};
