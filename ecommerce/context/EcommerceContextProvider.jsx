"use client";

// import { products } from "@/data/images/data";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const EcommerceContext = createContext();

export const EcommerceContextProvider = ({ children }) => {
  const [addItems, setAddItems] = useState({});
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  

  /* Add a new address - returns the created address */
 const addAddress = (data) => {
   const id = `addr-${Date.now()}`;

   const next = { ...data, id };

   setAddresses((prev) => [...prev, next]);

   if (!selectedAddressId) {
     setSelectedAddressId(id);
   }

   return next;
 };

  /* Update an existing address */
  const updateAddress = (id, data) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, id } : a)),
    );
  };

  /* Delete an address */
  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }
  };

  /* Select an address */
  const selectAddress = (id) => {
    setSelectedAddressId(id);
  };

  /* The currently selected address object (or null) */
  const address = addresses.find((a) => a.id === selectedAddressId) || null;

  /* ---------------------------------------------------------
     Cart logic - unchanged
  --------------------------------------------------------- */
const handleAddToCart = async (itemId, size) => {
  try {
    const { data } = await axios.post("/api/add-to-cart", {
      itemId,
      size,
    });

    if (data.success) {
      setAddItems((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [size]: (prev[itemId]?.[size] || 0) + 1,
        },
      }));
    }
  } catch (error) {
    console.error("Add to cart error:", error);
  }
};

  const handleRemoveFromCart = (productId, size) => {
    setAddItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: Math.max(0, (prev[productId]?.[size] || 0) - 1),
      },
    }));
  };

  const updateItemQuantity = (productId, size, quantity) => {
    setAddItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: Math.max(0, quantity),
      },
    }));
  };

  const getItemQuantity = (productId, size) => {
    return addItems?.[productId]?.[size] ?? 0;
  };

  const handleCartCount = () => {
    let count = 0;
    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        count += addItems[productId][size];
      }
    }
    return count;
  };


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
}, [addItems, products]);

  const deleteItemFromCart = (productId, size) => {
    setAddItems((prev) => {
      const updatedCart = { ...prev };
      if (!updatedCart[productId]) return updatedCart;

      delete updatedCart[productId][size];

      if (Object.keys(updatedCart[productId]).length === 0) {
        delete updatedCart[productId];
      }

      return updatedCart;
    });
  };


  //fetch all products
  useEffect(() =>{
    const fetchProduct = async() =>{
      try {
        const {data} = await axios.get("/api/list");
        if (data.success) {
          setProducts(data.list);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchProduct()
  },[])


  // check if is the user

useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-me");

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  checkAuth();
}, []);

  /* ---------------------------------------------------------
     Context value
  --------------------------------------------------------- */
  const commerceValue = {
    // Cart
    addItems,
    handleAddToCart,
    handleRemoveFromCart,
    getItemQuantity,
    updateItemQuantity,
    handleCartCount,
    deleteItemFromCart,
    totalAmount,

    // Address (multi, session-only)
    addresses,
    address, // currently selected one (or null)
    selectedAddressId,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    products
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
