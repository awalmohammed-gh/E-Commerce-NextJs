"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { fetchProducts } from "@/lib/productsApi";

/*
  Loads a page of products from /api/products for the given params.
  Re-fetches when params change and cancels stale requests, so fast
  filter changes can't show out-of-order results.
*/
export default function useProducts(params, { enabled = true } = {}) {
  const [reloadKey, setReloadKey] = useState(0);
  // Result of the last finished request, tagged with the request it answers
  const [result, setResult] = useState({
    requestKey: null,
    products: [],
    pagination: null,
    error: null,
  });

  const paramsKey = JSON.stringify(params);
  const requestKey = `${paramsKey}#${reloadKey}`;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    fetchProducts(JSON.parse(paramsKey), { signal: controller.signal })
      .then(({ products, pagination }) => {
        setResult({ requestKey, products, pagination, error: null });
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error(error);
        setResult({
          requestKey,
          products: [],
          pagination: null,
          error: "Unable to load products.",
        });
      });

    return () => controller.abort();
  }, [paramsKey, requestKey, enabled]);

  // Loading until the response for the current params has arrived
  const loading = enabled && result.requestKey !== requestKey;

  return {
    products: loading ? [] : result.products,
    pagination: loading ? null : result.pagination,
    error: loading ? null : result.error,
    loading,
    retry: () => setReloadKey((k) => k + 1),
  };
}
