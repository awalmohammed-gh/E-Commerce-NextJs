import jwt from "jsonwebtoken";

export function getAuthUser(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    return decoded;
  } catch (error) {
    console.error("JWT error:", error);
    return null;
  }
}
