import axios from "axios";

/*
  Client for the customer settings endpoints. Every call resolves (never
  throws) with { success, message, status?, settings?, errors? } so the
  page can show a toast either way.
*/
const call = async (request, fallback) => {
  try {
    const { data } = await request();
    return {
      success: Boolean(data.success),
      message: data.message,
      settings: data.settings,
    };
  } catch (error) {
    return {
      success: false,
      status: error?.response?.status,
      message: error?.response?.data?.message || fallback,
      errors: error?.response?.data?.errors,
    };
  }
};

export const fetchAccountSettings = (options) =>
  axios.get("/api/user/settings", options).then(({ data }) => data.settings);

export const saveAccountSettings = (changes) =>
  call(() => axios.patch("/api/user/settings", changes), "Could not save your settings");

export const changeAccountPassword = (fields) =>
  call(() => axios.post("/api/user/change-password", fields), "Could not change your password");

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return call(() => axios.post("/api/user/avatar", formData), "Could not upload your photo");
};

export const removeProfileImage = () =>
  call(() => axios.delete("/api/user/avatar"), "Could not remove your photo");
