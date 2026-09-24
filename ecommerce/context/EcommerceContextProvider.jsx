"use client";

import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const EcommerceContext = createContext();

const EMPTY_CART = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  issues: [],
};

export const EcommerceContextProvider = ({ children }) => {
  // { [productId]: { [size]: quantity } } - mirrors the user's saved cart
  const [savedItems, setAddItems] = useState({});
  // Server-priced view of the cart (names, images, prices, stock issues)
  const [savedCart, setCart] = useState(EMPTY_CART);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Saved addresses from /api/user/addresses (the default comes first)
  const [savedAddresses, setAddresses] = useState([]);
  const [addressesStatus, setAddressesStatus] = useState("idle"); // idle | ready | error

  // Wishlist from /api/user/wishlist: [{ productId, addedAt, product, available }]
  const [savedWishlist, setWishlist] = useState([]);
  const [wishlistStatus, setWishlistStatus] = useState("idle"); // idle | ready | error
  // Product ids with a save/remove request in flight
  const [wishlistPending, setWishlistPending] = useState({});

  // Signed-out visitors always see an empty cart, wishlist and no addresses
  const addItems = isLoggedIn ? savedItems : {};
  const cart = isLoggedIn ? savedCart : EMPTY_CART;
  const cartLoading = !authChecked || (isLoggedIn && !cartLoaded);
  const addresses = isLoggedIn ? savedAddresses : [];
  const addressesLoading = !authChecked || (isLoggedIn && addressesStatus === "idle");
  const addressesError = isLoggedIn && addressesStatus === "error";
  const defaultAddress = addresses.find((a) => a.isDefault) || null;
  const wishlist = isLoggedIn ? savedWishlist : [];
  const wishlistLoading = !authChecked || (isLoggedIn && wishlistStatus === "idle");
  const wishlistError = isLoggedIn && wishlistStatus === "error";
  const wishlistIds = new Set(wishlist.map((item) => item.productId));

  /* ---------------------------------------------------------
     Wishlist - saved in MongoDB; the UI only changes after
     the API confirms. Responses return the full updated list.
  --------------------------------------------------------- */
  const refreshWishlist = useCallback(
    () =>
      axios
        .get("/api/user/wishlist")
        .then(({ data }) => {
          setWishlist(data.items || []);
          setWishlistStatus("ready");
        })
        .catch((error) => {
          console.error(error?.response?.data?.message || "Could not load wishlist");
          setWishlistStatus("error");
        }),
    [],
  );

  const retryWishlist = () => {
    setWishlistStatus("idle");
    refreshWishlist();
  };

  const isInWishlist = (productId) => wishlistIds.has(String(productId));
  const isWishlistPending = (productId) => Boolean(wishlistPending[String(productId)]);

  const runWishlistRequest = async (productId, request, fallback) => {
    const id = String(productId);
    if (wishlistPending[id]) return { success: false, pending: true };

    setWishlistPending((current) => ({ ...current, [id]: true }));
    try {
      const { data } = await request(id);
      if (data.success && Array.isArray(data.items)) {
        setWishlist(data.items);
        setWishlistStatus("ready");
      }
      return { success: data.success, message: data.message };
    } catch (error) {
      return {
        success: false,
        status: error?.response?.status,
        message: error?.response?.data?.message || fallback,
      };
    } finally {
      setWishlistPending(({ [id]: _done, ...rest }) => rest);
    }
  };

  const addToWishlist = (productId) =>
    runWishlistRequest(
      productId,
      (id) => axios.post("/api/user/wishlist", { productId: id }),
      "Could not save this product",
    );

  const removeFromWishlist = (productId) =>
    runWishlistRequest(
      productId,
      (id) => axios.delete(`/api/user/wishlist/${id}`),
      "Could not remove this product",
    );

  const toggleWishlist = (productId) =>
    isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);

  /* ---------------------------------------------------------
     Addresses - every change goes through the API, which
     enforces ownership and the single-default rule. Each
     response returns the full updated list.
  --------------------------------------------------------- */
  const addressResult = (data) => {
    if (data.success && Array.isArray(data.addresses)) setAddresses(data.addresses);
    return { success: data.success, message: data.message, address: data.address };
  };

  const addressError = (error, fallback) => ({
    success: false,
    status: error?.response?.status,
    message: error?.response?.data?.message || fallback,
    errors: error?.response?.data?.errors,
  });

  const refreshAddresses = useCallback(
    () =>
      axios
        .get("/api/user/addresses")
        .then(({ data }) => {
          setAddresses(data.addresses || []);
          setAddressesStatus("ready");
        })
        .catch((error) => {
          console.error(error?.response?.data?.message || "Could not load addresses");
          setAddressesStatus("error");
        }),
    [],
  );

  // For "Try again" buttons: show loading, then reload
  const retryAddresses = () => {
    setAddressesStatus("idle");
    refreshAddresses();
  };

  const createAddress = async (fields) => {
    try {
      const { data } = await axios.post("/api/user/addresses", fields);
      return addressResult(data);
    } catch (error) {
      return addressError(error, "Could not save address");
    }
  };

  const updateAddress = async (id, fields) => {
    try {
      const { data } = await axios.put(`/api/user/addresses/${id}`, fields);
      return addressResult(data);
    } catch (error) {
      return addressError(error, "Could not update address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`/api/user/addresses/${id}`);
      return addressResult(data);
    } catch (error) {
      return addressError(error, "Could not delete address");
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const { data } = await axios.patch(`/api/user/addresses/${id}/default`);
      return addressResult(data);
    } catch (error) {
      return addressError(error, "Could not update default address");
    }
  };

  /* ---------------------------------------------------------
     Cart - every change goes through the server, which checks
     the product, size and stock and returns the priced cart
  --------------------------------------------------------- */
  const applyCartResponse = (data) => {
    setAddItems(data.cartData || {});
    setCart(data.cart || EMPTY_CART);
  };

  const cartError = (error, fallback) => ({
    success: false,
    status: error?.response?.status,
    message: error?.response?.data?.message || fallback,
  });

  const refreshCart = useCallback(
    () =>
      axios
        .get("/api/cart")
        .then(({ data }) => {
          if (data.success) applyCartResponse(data);
        })
        .catch((error) => {
          // 401 = signed out: an empty cart is correct
          if (error?.response?.status !== 401) {
            console.error(error.response?.data?.message || "Could not load cart");
          }
          setAddItems({});
          setCart(EMPTY_CART);
        })
        .finally(() => setCartLoaded(true)),
    [],
  );

  // Returns { success, message, status } so callers can show feedback
  const handleAddToCart = async (itemId, size, quantity = 1) => {
    try {
      const { data } = await axios.post("/api/add-to-cart", {
        itemId,
        size,
        quantity,
      });
      if (data.success) applyCartResponse(data);
      return { success: data.success, message: data.message };
    } catch (error) {
      return cartError(error, "Could not add item to cart");
    }
  };

  const updateItemQuantity = async (productId, size, quantity) => {
    try {
      const { data } = await axios.patch("/api/cart", {
        itemId: productId,
        size,
        quantity: Math.max(0, quantity),
      });
      if (data.success) applyCartResponse(data);
      return { success: data.success, message: data.message };
    } catch (error) {
      return cartError(error, "Could not update cart");
    }
  };

  const getItemQuantity = (productId, size) => {
    return addItems?.[productId]?.[size] ?? 0;
  };

  const handleRemoveFromCart = (productId, size) =>
    updateItemQuantity(productId, size, getItemQuantity(productId, size) - 1);

  const deleteItemFromCart = (productId, size) =>
    updateItemQuantity(productId, size, 0);

  const handleCartCount = () => {
    let count = 0;
    for (const productId in addItems) {
      for (const size in addItems[productId]) {
        count += addItems[productId][size];
      }
    }
    return count;
  };

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
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Load the cart, addresses and wishlist once auth is known, and again after signing in
  useEffect(() => {
    if (authChecked && isLoggedIn) {
      refreshCart();
      refreshAddresses();
      refreshWishlist();
    }
  }, [authChecked, isLoggedIn, refreshCart, refreshAddresses, refreshWishlist]);

  /* ---------------------------------------------------------
     Context value
  --------------------------------------------------------- */
  const commerceValue = {
    // Cart
    addItems,
    setAddItems,
    cart,
    cartLoading,
    refreshCart,
    handleAddToCart,
    handleRemoveFromCart,
    getItemQuantity,
    updateItemQuantity,
    handleCartCount,
    deleteItemFromCart,
    totalAmount: cart.subtotal,

    // Saved addresses (MongoDB)
    addresses,
    defaultAddress,
    addressesLoading,
    addressesError,
    refreshAddresses,
    retryAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Wishlist (MongoDB)
    wishlist,
    wishlistCount: wishlist.length,
    wishlistLoading,
    wishlistError,
    retryWishlist,
    isInWishlist,
    isWishlistPending,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,

    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    authChecked,
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
