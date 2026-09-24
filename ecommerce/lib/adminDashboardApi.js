import axios from "axios";

// Same-origin requests: the httpOnly adminToken cookie is sent automatically

export async function fetchDashboardOverview({ signal } = {}) {
  const { data } = await axios.get("/api/admin/dashboard/overview", { signal });

  if (!data.success) {
    throw new Error(data.message || "Failed to load dashboard");
  }

  return data.data;
}

export async function fetchRevenue(period, { signal } = {}) {
  const { data } = await axios.get("/api/admin/dashboard/revenue", {
    params: { period },
    signal,
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to load revenue");
  }

  return data.data;
}

export const isRequestCanceled = (error) => axios.isCancel(error);

export const isUnauthorized = (error) =>
  [401, 403].includes(error?.response?.status);

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
