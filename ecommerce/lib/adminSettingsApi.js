import axios from "axios";

// Same-origin requests: the httpOnly adminToken cookie is sent automatically

const unwrap = (data, fallback) => {
  if (!data.success) throw new Error(data.message || fallback);
  return data;
};

export async function fetchSettings() {
  const { data } = await axios.get("/api/admin/settings");
  return unwrap(data, "Failed to load settings").data;
}

// Partial update: { [section]: { ...fields } }
export async function saveSettings(update) {
  const { data } = await axios.put("/api/admin/settings", update);
  return unwrap(data, "Failed to save settings").data.settings;
}

export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append("logo", file);

  const { data } = await axios.post("/api/admin/settings/logo", formData);
  return unwrap(data, "Failed to upload logo").data.settings;
}

export async function changeAdminPassword(passwords) {
  const { data } = await axios.post(
    "/api/admin/settings/change-password",
    passwords,
  );
  return unwrap(data, "Failed to change password").message;
}

export async function logoutAllAdminSessions() {
  const { data } = await axios.post("/api/admin/settings/logout-all");
  return unwrap(data, "Failed to sign out other sessions").message;
}

// Field-level errors from a 400 response, keyed "section.field"
export const getFieldErrors = (error) => error?.response?.data?.errors || {};
