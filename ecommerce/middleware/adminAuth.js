import jwt from "jsonwebtoken";

export async function getAdminAuth(request) {
  try {
    const token = request.cookies.get("adminToken")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
