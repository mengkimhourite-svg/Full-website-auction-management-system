import axios, { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? "";
    const method: string = (error.config?.method ?? "get").toLowerCase();
    const isAuthEndpoint = requestUrl.includes("/api/auth/");
    // A background GET /api/watchlist returning 401 simply means "not logged
    // in"; it must not kick the user out of public pages (e.g. /auctions).
    const isWatchlistRead = requestUrl.includes("/api/watchlist") && method === "get";
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !isWatchlistRead &&
      typeof window !== "undefined"
    ) {
      // Clear any stale client state on auth failure
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
