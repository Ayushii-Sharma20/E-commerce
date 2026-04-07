export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  blocked?: boolean;
  sellerStatus?: "pending" | "approved" | "rejected";
};

type TokenPayload = {
  userId?: string;
  id?: string;
  role?: "buyer" | "seller" | "admin";
  exp?: number;
};

const decodeTokenPayload = (token: string): TokenPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decodedPayload = JSON.parse(window.atob(`${normalizedPayload}${padding}`));
    return decodedPayload as TokenPayload;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("token");
  if (!token) {
    return null;
  }

  const payload = decodeTokenPayload(token);
  if (!payload) {
    clearSession();
    return null;
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearSession();
    return null;
  }

  return token;
};

export const setSession = (token: string, user: SessionUser) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("token", token);
  window.localStorage.setItem("user", JSON.stringify(user));
  window.localStorage.setItem("userId", user._id);
};

export const getSessionUser = (): SessionUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const payload = decodeTokenPayload(token);
  if (!payload || !(payload.userId || payload.id) || !payload.role) {
    clearSession();
    return null;
  }

  const rawUser = window.localStorage.getItem("user");
  const tokenBackedUser: SessionUser = {
    _id: String(payload.userId || payload.id),
    name: "",
    email: "",
    role: payload.role
  };

  if (!rawUser) {
    return tokenBackedUser;
  }

  try {
    const storedUser = JSON.parse(rawUser) as SessionUser;

    if (storedUser._id !== tokenBackedUser._id || storedUser.role !== tokenBackedUser.role) {
      const mergedUser = {
        ...storedUser,
        ...tokenBackedUser
      };
      window.localStorage.setItem("user", JSON.stringify(mergedUser));
      window.localStorage.setItem("userId", mergedUser._id);
      return mergedUser;
    }

    return storedUser;
  } catch {
    return tokenBackedUser;
  }
};

export const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("userId");
};

export const handleUnauthorizedSession = () => {
  clearSession();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const isExpiredSessionError = (error: any) => {
  const statusCode = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.response?.data?.error || ""
  ).toLowerCase();

  if (statusCode === 401) {
    return true;
  }

  if (statusCode !== 403) {
    return false;
  }

  return (
    message.includes("token") ||
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("session") ||
    message.includes("expired")
  );
};
