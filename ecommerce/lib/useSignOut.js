"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEcommerce } from "@/context/EcommerceContextProvider";

/*
  Signs the customer out: clears the auth cookie on the server, then the
  signed-in state in context (cart, wishlist and addresses follow it)
  and returns to the homepage. Resolves with { success, message }.
*/
export function useSignOut() {
  const router = useRouter();
  const { setUser, setIsLoggedIn } = useEcommerce();

  return async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      setIsLoggedIn(false);
      router.push("/");
      return { success: true, message: "You're signed out." };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Couldn't sign you out. Please try again.",
      };
    }
  };
}
