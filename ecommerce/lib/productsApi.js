import axios from "axios";

// Drops empty values so URLs stay clean (?category=Tops, not ?category=&search=)
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && value !== false,
    ),
  );

export async function fetchProducts(params, { signal } = {}) {
  const { data } = await axios.get("/api/products", {
    params: cleanParams(params),
    signal,
  });
  if (!data.success) throw new Error(data.message || "Unable to load products");
  return data; // { products, pagination, sort }
}

export async function fetchProduct(id, { signal } = {}) {
  const { data } = await axios.get(`/api/products/${encodeURIComponent(id)}`, {
    signal,
  });
  if (!data.success) throw new Error(data.message || "Unable to load product");
  return data.product;
}

export async function fetchCategories({ signal } = {}) {
  const { data } = await axios.get("/api/products/categories", { signal });
  if (!data.success) throw new Error(data.message || "Unable to load categories");
  return data.categories;
}

export const isNotFound = (error) => error?.response?.status === 404;
